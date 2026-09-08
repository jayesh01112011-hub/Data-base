import { Router } from 'express';
import { requireAuth, AuthenticatedRequest } from '../auth';
import { createApiKey, getUserApiKeys, revokeApiKey, deleteApiKey } from '../services/apiKeyService';

const router = Router();

router.use(requireAuth);

router.get('/', (req: AuthenticatedRequest, res) => {
  const keys = getUserApiKeys(req.user!.id);
  return res.json({ success: true, keys });
});

router.post('/', (req: AuthenticatedRequest, res) => {
  const { name, expiresInDays } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, error: 'Key name is required (e.g. "Production Backend")' });
  }

  const { keyRecord, rawKey } = createApiKey(req.user!.id, name.trim(), expiresInDays ? Number(expiresInDays) : undefined);

  return res.status(201).json({
    success: true,
    message: 'API Key generated successfully',
    key: keyRecord,
    secretKey: rawKey,
    warning: 'Copy this key now and store it safely in your environment variables. For security reasons, you will not be able to view this key again.'
  });
});

router.post('/:id/revoke', (req: AuthenticatedRequest, res) => {
  const success = revokeApiKey(req.user!.id, req.params.id);
  if (!success) {
    return res.status(404).json({ success: false, error: 'API key not found or already revoked' });
  }
  return res.json({ success: true, message: 'API key revoked successfully' });
});

router.delete('/:id', (req: AuthenticatedRequest, res) => {
  const success = deleteApiKey(req.user!.id, req.params.id);
  if (!success) {
    return res.status(404).json({ success: false, error: 'API key not found' });
  }
  return res.json({ success: true, message: 'API key deleted successfully' });
});

export default router;
