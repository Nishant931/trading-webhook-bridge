"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const signalQueue_1 = require("../queue/signalQueue");
const router = (0, express_1.Router)();
router.post('/webhook', async (req, res) => {
    const payload = req.body;
    if (payload.secret_key !== process.env.WEBHOOK_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        await signalQueue_1.signalQueue.add('processSignal', payload);
        return res.status(200).json({ status: 'ok', message: 'Signal queued' });
    }
    catch (err) {
        console.error('Failed to queue signal:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.default = router;
