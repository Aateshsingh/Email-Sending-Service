// ...existing code...
import { EmailService } from './emailService';
import { Email } from './types';

const service = new EmailService({ maxRetries: 3, rateLimit: 5, circuitBreakerThreshold: 3 });

const email: Email = {
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
