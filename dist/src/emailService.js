"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const providers_1 = require("./providers");
class EmailService {
    constructor(options = {}) {
        this.statusMap = new Map();
        this.sentIds = new Set();
        this.queue = [];
        this.sentTimestamps = [];
        this.providerFailures = new Map();
        this.providers = [new providers_1.MockProviderA(), new providers_1.MockProviderB()];
        this.maxRetries = options.maxRetries ?? 3;
        this.rateLimit = options.rateLimit ?? 10;
        this.circuitBreakerThreshold = options.circuitBreakerThreshold ?? 5;
    }
    async sendEmail(email) {
        if (this.sentIds.has(email.id)) {
            return this.statusMap.get(email.id);
        }
        if (!this._canSendNow()) {
            this.queue.push(email);
            this._setStatus(email, 'queued');
            return this.statusMap.get(email.id);
        }
        this._setStatus(email, 'pending');
        let lastError = '';
        for (let i = 0; i < this.providers.length; i++) {
            const provider = this.providers[i];
            if (this._isCircuitOpen(provider))
                continue;
            for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
                try {
                    this._log(`Attempt ${attempt} with ${provider.name} for email ${email.id}`);
                    const sent = await provider.send(email);
                    if (sent) {
                        this.sentIds.add(email.id);
                        this._setStatus(email, 'sent', attempt, provider.name);
                        this._recordSend();
                        this._resetFailures(provider);
                        return this.statusMap.get(email.id);
                    }
                    else {
                        this._incrementFailures(provider);
                        await this._backoff(attempt);
                    }
                }
                catch (err) {
                    lastError = err.message;
                    this._incrementFailures(provider);
                    await this._backoff(attempt);
                }
            }
            this._log(`Provider ${provider.name} failed for email ${email.id}`);
        }
        this._setStatus(email, 'failed', this.maxRetries, undefined, lastError);
        return this.statusMap.get(email.id);
    }
    processQueue() {
        while (this.queue.length && this._canSendNow()) {
            const email = this.queue.shift();
            this.sendEmail(email);
        }
    }
    getStatus(emailId) {
        return this.statusMap.get(emailId);
    }
    // --- Private helpers ---
    _setStatus(email, status, attempts = 0, lastProvider, error) {
        this.statusMap.set(email.id, { id: email.id, status, attempts, lastProvider, error });
    }
    _canSendNow() {
        const now = Date.now();
        this.sentTimestamps = this.sentTimestamps.filter(ts => now - ts < 60000);
        return this.sentTimestamps.length < this.rateLimit;
    }
    _recordSend() {
        this.sentTimestamps.push(Date.now());
    }
    async _backoff(attempt) {
        const delay = Math.pow(2, attempt) * 100;
        await new Promise(res => setTimeout(res, delay));
    }
    _isCircuitOpen(provider) {
        return (this.providerFailures.get(provider.name) ?? 0) >= this.circuitBreakerThreshold;
    }
    _incrementFailures(provider) {
        this.providerFailures.set(provider.name, (this.providerFailures.get(provider.name) ?? 0) + 1);
    }
    _resetFailures(provider) {
        this.providerFailures.set(provider.name, 0);
    }
    _log(msg) {
        console.log(`[EmailService] ${msg}`);
    }
}
exports.EmailService = EmailService;
// ...existing code...
