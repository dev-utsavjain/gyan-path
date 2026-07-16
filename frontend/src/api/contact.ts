import { apiFetch } from './client';

export interface ContactPayload {
  name: string;
  email: string;
  phone: string;
  message: string;
}

interface ContactResponse {
  received: boolean;
}

// Submits the public "Contact Us" form to the backend, which stores it and
// emails the team.
export function submitContact(payload: ContactPayload): Promise<ContactResponse> {
  return apiFetch<ContactResponse>('/contact', { method: 'POST', body: payload });
}
