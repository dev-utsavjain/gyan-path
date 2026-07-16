import { apiFetch } from './client';

export type Settings = Record<string, string>;

interface SettingsResponse {
  settings: Settings;
}

export function fetchSettings(): Promise<Settings> {
  return apiFetch<SettingsResponse>('/settings').then((r) => r.settings || {});
}

export function updateSettings(values: Settings): Promise<{ saved: number }> {
  return apiFetch<{ saved: number }>('/admin/settings', { method: 'PUT', body: values, auth: true });
}
