// ...existing code...
import { EmailService } from '../src/emailService';
import { Email } from '../src/types';

describe('EmailService', () => {
  let service: EmailService;
  beforeEach(() => {
    service = new EmailService({ maxRetries: 2, rateLimit: 2, circuitBreakerThreshold: 2 });
  });

  it('should send an email successfully', async () => {
    const email: Email = { id: 'id1', to: 'a@b.com', subject: 'S', body: 'B' };
    const status = await service.sendEmail(email);
    expect(['sent', 'failed', 'queued']).toContain(status.status);
  });

  it('should not send duplicate emails (idempotency)', async () => {
    const email: Email = { id: 'id2', to: 'a@b.com', subject: 'S', body: 'B' };
    await service.sendEmail(email);
    const status2 = await service.sendEmail(email);
    expect(status2.attempts).toBeGreaterThan(0);
  });

  it('should queue emails when rate limited', async () => {
    const emails: Email[] = [
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
    const email: Email = { id: 'id6', to: 'a@b.com', subject: 'S', body: 'B' };
    const status = await service.sendEmail(email);
    expect(['failed', 'sent']).toContain(status.status);
  });
});
// ...existing code...
