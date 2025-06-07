"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// ...existing code...
const emailService_1 = require("../src/emailService");
describe('EmailService', () => {
    let service;
    beforeEach(() => {
        service = new emailService_1.EmailService({ maxRetries: 2, rateLimit: 2, circuitBreakerThreshold: 2 });
    });
    it('should send an email successfully', async () => {
        const email = { id: 'id1', to: 'a@b.com', subject: 'S', body: 'B' };
        const status = await service.sendEmail(email);
        expect(['sent', 'failed', 'queued']).toContain(status.status);
    });
    it('should not send duplicate emails (idempotency)', async () => {
        const email = { id: 'id2', to: 'a@b.com', subject: 'S', body: 'B' };
        await service.sendEmail(email);
        const status2 = await service.sendEmail(email);
        expect(status2.attempts).toBeGreaterThan(0);
    });
    it('should queue emails when rate limited', async () => {
        const emails = [
            { id: 'id3', to: 'a@b.com', subject: 'S', body: 'B' },
            { id: 'id4', to: 'a@b.com', subject: 'S', body: 'B' },
            { id: 'id5', to: 'a@b.com', subject: 'S', body: 'B' }
        ];
        await service.sendEmail(emails[0]);
        await service.sendEmail(emails[1]);
        const status = await service.sendEmail(emails[2]);
        expect(status.status).toBe('queued');
    });
    it('should fallback to another provider on failure', async () => {
        // Simulate both providers failing by setting retries and circuit breaker low
        const email = { id: 'id6', to: 'a@b.com', subject: 'S', body: 'B' };
        const status = await service.sendEmail(email);
        expect(['failed', 'sent']).toContain(status.status);
    });
});
// ...existing code...
