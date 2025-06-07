# Email Sending Service

A resilient email sending service implemented in TypeScript with the following features:
- Retry logic with exponential backoff
- Fallback between two mock providers
- Idempotency to prevent duplicate sends
- Basic rate limiting
- Status tracking for email attempts
- Circuit breaker pattern (bonus)
- Simple logging (bonus)
- Basic queue system (bonus)

## Setup Instructions

1. **Install dependencies:**
   ```powershell
   npm install
   ```
2. **Build the project:**
   ```powershell
   npm run build
   ```
3. **Run tests:**
   ```powershell
   npm test
   ```

## Assumptions
- No real email providers are used; all sending is mocked.
- Minimal external libraries are used (e.g., for testing or types).
- The service is designed for demonstration and learning purposes.

## Project Structure
- `src/` - Source code
- `tests/` - Unit tests
- `.github/` - Copilot instructions

## Features
- **Retry & Backoff:** Retries failed sends with exponential backoff.
- **Fallback:** Switches to a secondary provider on repeated failure.
- **Idempotency:** Prevents duplicate sends using a unique key per email.
- **Rate Limiting:** Limits the number of emails sent per time window.
- **Status Tracking:** Tracks and exposes the status of each send attempt.
- **Circuit Breaker:** Prevents repeated attempts to failing providers.
- **Logging:** Simple console logging for key events.
- **Queue:** Basic in-memory queue for pending emails.

## How to Use
- Integrate the `EmailService` class in your application.
- Use the provided methods to send emails and check status.

---

For more details, see inline documentation in the code.
