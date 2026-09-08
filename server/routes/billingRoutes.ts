import { Router } from 'express';
import { requireAuth, AuthenticatedRequest } from '../auth';
import { getAllPlans, getUserSubscription, changeUserPlan, cancelSubscription } from '../services/billingService';

const router = Router();

// Public plans list (must come from backend rather than hardcoded in UI)
router.get('/plans', (req, res) => {
  const plans = getAllPlans();
  return res.json({ success: true, plans });
});

// Authenticated user subscription
router.get('/subscription', requireAuth, (req: AuthenticatedRequest, res) => {
  const data = getUserSubscription(req.user!.id);
  return res.json({ success: true, ...data });
});

// Change user plan (Upgrade / Downgrade)
router.post('/change-plan', requireAuth, (req: AuthenticatedRequest, res) => {
  const { planId } = req.body;
  if (!planId) {
    return res.status(400).json({ success: false, error: 'Target planId is required' });
  }

  try {
    const updated = changeUserPlan(req.user!.id, planId);
    return res.json({
      success: true,
      message: `Plan changed successfully to ${planId.toUpperCase()}`,
      ...updated
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message || 'Failed to change plan' });
  }
});

// Cancel subscription
router.post('/cancel-subscription', requireAuth, (req: AuthenticatedRequest, res) => {
  const success = cancelSubscription(req.user!.id);
  if (!success) {
    return res.status(400).json({ success: false, error: 'Failed to cancel subscription' });
  }
  return res.json({
    success: true,
    message: 'Subscription marked to cancel at end of current billing period. Full access remains active until then.'
  });
});

// Simulate webhook from payment provider
router.post('/simulate-webhook', (req, res) => {
  const { event_type, data } = req.body;
  console.log('[Billing Webhook Received]:', event_type, data);
  return res.json({
    success: true,
    received: true,
    event: event_type || 'payment.succeeded',
    timestamp: new Date().toISOString()
  });
});

export default router;
