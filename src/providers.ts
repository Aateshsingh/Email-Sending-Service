// ...existing code...
import { Email, EmailProvider } from './types';

export class MockProviderA implements EmailProvider {
  name = 'MockProviderA';
  async send(email: Email): Promise<boolean> {
    // Simulate random failure
    return Math.random() > 0.3;
  }
}

export class MockProviderB implements EmailProvider {
  name = 'MockProviderB';
  async send(email: Email): Promise<boolean> {
    // Simulate random failure
    return Math.random() > 0.5;
  }
}
// ...existing code...
