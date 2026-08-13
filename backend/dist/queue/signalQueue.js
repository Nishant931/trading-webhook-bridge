"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setSocketIO = exports.signalQueue = void 0;
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const optionMapper_1 = require("../utils/optionMapper");
const connection = new ioredis_1.default({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
    maxRetriesPerRequest: null,
});
exports.signalQueue = new bullmq_1.Queue('signalQueue', { connection });
let ioInstance = null;
const setSocketIO = (io) => {
    ioInstance = io;
};
exports.setSocketIO = setSocketIO;
const worker = new bullmq_1.Worker('signalQueue', async (job) => {
    const payload = job.data;
    let tradedSymbol = payload.symbol;
    if (payload.index_name && payload.spot_price && payload.option_type && payload.strike_offset) {
        tradedSymbol = (0, optionMapper_1.getOptionSymbol)(payload.index_name, payload.spot_price, payload.option_type, payload.strike_offset);
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
