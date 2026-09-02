import { apiFetch } from './client';

export interface Coordinator {
  id: number;
  name: string;
  code: string;
  active: boolean;
}

export type CoordinatorInput = Pick<Coordinator, 'name' | 'code' | 'active'>;

interface ListResponse {
  coordinators: Coordinator[];
}

// Public: the active list the enrollment form's dropdown is built from.
export function fetchCoordinators(): Promise<Coordinator[]> {
  return apiFetch<ListResponse>('/coordinators').then((r) => r.coordinators || []);
}

// Admin: everything, including deactivated coordinators.
export function fetchAllCoordinators(): Promise<Coordinator[]> {
  return apiFetch<ListResponse>('/admin/coordinators', { auth: true }).then((r) => r.coordinators || []);
}

export function createCoordinator(data: CoordinatorInput): Promise<{ coordinator: Coordinator }> {
  return apiFetch<{ coordinator: Coordinator }>('/admin/coordinators', { method: 'POST', body: data, auth: true });
}

export function updateCoordinator(id: number, data: CoordinatorInput): Promise<{ coordinator: Coordinator }> {
  return apiFetch<{ coordinator: Coordinator }>(`/admin/coordinators/${id}`, { method: 'PUT', body: data, auth: true });
}

export function deleteCoordinator(id: number): Promise<{ deleted: boolean }> {
  return apiFetch<{ deleted: boolean }>(`/admin/coordinators/${id}`, { method: 'DELETE', auth: true });
}

// How a coordinator is shown everywhere a person has to recognise one.
export function coordinatorLabel(c: Coordinator): string {
  return `${c.name} — ${c.code}`;
}
