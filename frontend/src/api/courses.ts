import { apiFetch } from './client';

export type CourseCategory = 'basic' | 'additional_support' | 'premium' | 'upcoming';
export type CourseStatus = 'active' | 'hidden';

export interface Course {
  id: number;
  title: string;
  description: string;
  image_url: string;
  category: CourseCategory;
  price: number;
  features: string[] | null;
  status: CourseStatus;
  sort_order: number;
}

export type CourseInput = Omit<Course, 'id'>;

interface ListResponse {
  courses: Course[];
}

// Public catalogue (active courses only).
export function fetchCourses(): Promise<Course[]> {
  return apiFetch<ListResponse>('/courses').then((r) => r.courses || []);
}

// Admin: everything, including hidden.
export function fetchAllCourses(): Promise<Course[]> {
  return apiFetch<ListResponse>('/admin/courses', { auth: true }).then((r) => r.courses || []);
}

export function createCourse(data: CourseInput): Promise<{ course: Course }> {
  return apiFetch<{ course: Course }>('/admin/courses', { method: 'POST', body: data, auth: true });
}

export function updateCourse(id: number, data: CourseInput): Promise<{ course: Course }> {
  return apiFetch<{ course: Course }>(`/admin/courses/${id}`, { method: 'PUT', body: data, auth: true });
}

export function deleteCourse(id: number): Promise<{ deleted: boolean }> {
  return apiFetch<{ deleted: boolean }>(`/admin/courses/${id}`, { method: 'DELETE', auth: true });
}
