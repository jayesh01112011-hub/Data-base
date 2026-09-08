import crypto from 'node:crypto';
import { db, hashApiKey } from '../db';
import { AuthUser } from '../auth';

export interface APIKeyRecord {
  id: string;
  user_id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
  expires_at: string | null;
  is_active: number;
}

export function createApiKey(userId: string, name: string, expiresInDays?: number): { keyRecord: APIKeyRecord; rawKey: string } {
  const randomHex = crypto.randomBytes(24).toString('hex');
  const rawKey = `df_live_${randomHex}`;
  const keyHash = hashApiKey(rawKey);
  const keyPrefix = `${rawKey.slice(0, 11)}...${rawKey.slice(-4)}`;
  const id = `key_${crypto.randomBytes(8).toString('hex')}`;
  const now = new Date().toISOString();
  
  let expiresAt: string | null = null;
  if (expiresInDays && expiresInDays > 0) {
    expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString();
  }

  db.prepare(`
    INSERT INTO api_keys (id, user_id, name, key_hash, key_prefix, created_at, last_used_at, expires_at, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
  `).run(id, userId, name, keyHash, keyPrefix, now, null, expiresAt);

  const keyRecord: APIKeyRecord = {
    id,
    user_id: userId,
    name,
    key_prefix: keyPrefix,
    created_at: now,
    last_used_at: null,
    expires_at: expiresAt,
    is_active: 1
  };

  return { keyRecord, rawKey };
}

export function getUserApiKeys(userId: string): APIKeyRecord[] {
  return db.prepare(`
    SELECT id, user_id, name, key_prefix, created_at, last_used_at, expires_at, is_active
    FROM api_keys
    WHERE user_id = ?
    ORDER BY created_at DESC
  `).all(userId) as unknown as APIKeyRecord[];
}

export function revokeApiKey(userId: string, keyId: string): boolean {
  const result = db.prepare(`
    UPDATE api_keys
    SET is_active = 0
    WHERE id = ? AND user_id = ?
  `).run(keyId, userId);
  return result.changes > 0;
}

export function deleteApiKey(userId: string, keyId: string): boolean {
  const result = db.prepare(`
    DELETE FROM api_keys
    WHERE id = ? AND user_id = ?
  `).run(keyId, userId);
  return result.changes > 0;
}

export function validateApiKey(rawKey: string): { valid: boolean; user?: AuthUser; key?: APIKeyRecord; error?: string } {
  const keyHash = hashApiKey(rawKey);
  const key = db.prepare(`
    SELECT id, user_id, name, key_prefix, created_at, last_used_at, expires_at, is_active
    FROM api_keys
    WHERE key_hash = ?
  `).get(keyHash) as unknown as APIKeyRecord | undefined;

  if (!key) {
    return { valid: false, error: 'Invalid API key provided' };
  }

  if (key.is_active !== 1) {
    return { valid: false, error: 'This API key has been revoked' };
  }

  if (key.expires_at && new Date(key.expires_at) < new Date()) {
    return { valid: false, error: 'This API key has expired' };
  }

  const user = db.prepare(`
    SELECT id, name, email, role, status, plan_id
    FROM users
    WHERE id = ?
  `).get(key.user_id) as unknown as AuthUser | undefined;

  if (!user || user.status === 'suspended') {
    return { valid: false, error: 'User account associated with this key is inactive or suspended' };
  }

  // Update last_used_at asynchronously
  const now = new Date().toISOString();
  db.prepare('UPDATE api_keys SET last_used_at = ? WHERE id = ?').run(now, key.id);

  return { valid: true, user, key };
}
