import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { WebhookPayload } from '../types/signal';
import { getOptionSymbol } from '../utils/optionMapper';

const connection = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
  maxRetriesPerRequest: null,
});

export const signalQueue = new Queue('signalQueue', { connection });

let ioInstance: any = null;
export const setSocketIO = (io: any) => {
  ioInstance = io;
};

const worker = new Worker('signalQueue', async (job: Job) => {
  const payload: WebhookPayload = job.data;
  
  let tradedSymbol = payload.symbol;
  if (payload.index_name && payload.spot_price && payload.option_type && payload.strike_offset) {
    tradedSymbol = getOptionSymbol(payload.index_name, payload.spot_price, payload.option_type, payload.strike_offset);
  }

  console.log(`[Worker] Executing dummy broker order: ${payload.action} ${tradedSymbol}`);
  
  // Simulate execution delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const result = {
    status: 'SUCCESS',
    tradedSymbol,
    action: payload.action,
    timestamp: new Date().toISOString()
  };

  if (ioInstance) {
    ioInstance.emit('trade_update', result);
  }

  return result;
}, { connection });

worker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed: ${err.message}`);
});
