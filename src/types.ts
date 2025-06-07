// ...existing code...
export interface Email {
  id: string;
  to: string;
  subject: string;
  body: string;
}

export interface EmailProvider {
  name: string;
  send(email: Email): Promise<boolean>;
}
// ...existing code...
