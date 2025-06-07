"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// ...existing code...
const emailService_1 = require("./emailService");
const service = new emailService_1.EmailService({ maxRetries: 3, rateLimit: 5, circuitBreakerThreshold: 3 });
const email = {
    id: 'test-1',
    to: 'user@example.com',
    subject: 'Hello',
    body: 'This is a test email.'
};
(async () => {
    const status = await service.sendEmail(email);
    console.log('Send status:', status);
    service.processQueue();
})();
// ...existing code...
