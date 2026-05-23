const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function setSession(token: string, role: string) {
  localStorage.setItem('token', token);
  localStorage.setItem('role', role);
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  window.location.href = '/';
}

export async function api<T = any>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as any),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}/api${path}`, { ...opts, headers });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || res.statusText);
  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function apiUpload<T = any>(path: string, formData: FormData): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}/api${path}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}
