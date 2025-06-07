// ...existing code...
import { Email, EmailProvider } from './types';
import { MockProviderA, MockProviderB } from './providers';

interface EmailStatus {
  id: string;
  status: 'pending' | 'sent' | 'failed' | 'queued' | 'rate_limited';
  attempts: number;
  lastProvider?: string;
  error?: string;
}

interface EmailServiceOptions {
  maxRetries?: number;
  rateLimit?: number; // emails per minute
  circuitBreakerThreshold?: number;
}

export class EmailService {
  private providers: EmailProvider[];
  private statusMap: Map<string, EmailStatus> = new Map();
  private sentIds: Set<string> = new Set();
  private queue: Email[] = [];
  private rateLimit: number;
  private sentTimestamps: number[] = [];
  private maxRetries: number;
  private circuitBreakerThreshold: number;
  private providerFailures: Map<string, number> = new Map();

  constructor(options: EmailServiceOptions = {}) {
    this.providers = [new MockProviderA(), new MockProviderB()];
    this.maxRetries = options.maxRetries ?? 3;
    this.rateLimit = options.rateLimit ?? 10;
    this.circuitBreakerThreshold = options.circuitBreakerThreshold ?? 5;
  }

  async sendEmail(email: Email): Promise<EmailStatus> {
    if (this.sentIds.has(email.id)) {
      return this.statusMap.get(email.id)!;
    }
    if (!this._canSendNow()) {
      this.queue.push(email);
      this._setStatus(email, 'queued');
      return this.statusMap.get(email.id)!;
    }
    this._setStatus(email, 'pending');
    let lastError = '';
    for (let i = 0; i < this.providers.length; i++) {
      const provider = this.providers[i];
      if (this._isCircuitOpen(provider)) continue;
      for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
        try {
          this._log(`Attempt ${attempt} with ${provider.name} for email ${email.id}`);
          const sent = await provider.send(email);
          if (sent) {
            this.sentIds.add(email.id);
            this._setStatus(email, 'sent', attempt, provider.name);
            this._recordSend();
            this._resetFailures(provider);
            return this.statusMap.get(email.id)!;
          } else {
            this._incrementFailures(provider);
            await this._backoff(attempt);
          }
        } catch (err) {
          lastError = (err as Error).message;
          this._incrementFailures(provider);
          await this._backoff(attempt);
        }
      }
      this._log(`Provider ${provider.name} failed for email ${email.id}`);
    }
    this._setStatus(email, 'failed', this.maxRetries, undefined, lastError);
    return this.statusMap.get(email.id)!;
  }

  processQueue() {
    while (this.queue.length && this._canSendNow()) {
      const email = this.queue.shift()!;
      this.sendEmail(email);
    }
  }

  getStatus(emailId: string): EmailStatus | undefined {
    return this.statusMap.get(emailId);
  }

  // --- Private helpers ---
  private _setStatus(email: Email, status: EmailStatus['status'], attempts = 0, lastProvider?: string, error?: string) {
    this.statusMap.set(email.id, { id: email.id, status, attempts, lastProvider, error });
  }
  private _canSendNow(): boolean {
    const now = Date.now();
    this.sentTimestamps = this.sentTimestamps.filter(ts => now - ts < 60000);
    return this.sentTimestamps.length < this.rateLimit;
  }
  private _recordSend() {
    this.sentTimestamps.push(Date.now());
  }
  private async _backoff(attempt: number) {
    const delay = Math.pow(2, attempt) * 100;
    await new Promise(res => setTimeout(res, delay));
  }
  private _isCircuitOpen(provider: EmailProvider): boolean {
    return (this.providerFailures.get(provider.name) ?? 0) >= this.circuitBreakerThreshold;
  }
  private _incrementFailures(provider: EmailProvider) {
    this.providerFailures.set(provider.name, (this.providerFailures.get(provider.name) ?? 0) + 1);
  }
  private _resetFailures(provider: EmailProvider) {
    this.providerFailures.set(provider.name, 0);
  }
  private _log(msg: string) {
    console.log(`[EmailService] ${msg}`);
  }
}
// ...existing code...
