import { Router, Request, Response } from 'express';
import { signalQueue } from '../queue/signalQueue';
import { WebhookPayload } from '../types/signal';

const router = Router();

router.post('/webhook', async (req: Request, res: Response) => {
  const payload = req.body as WebhookPayload;

  if (payload.secret_key !== process.env.WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    await signalQueue.add('processSignal', payload);
    return res.status(200).json({ status: 'ok', message: 'Signal queued' });
  } catch (err) {
    console.error('Failed to queue signal:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
