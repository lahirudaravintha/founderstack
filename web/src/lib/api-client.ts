const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

type RequestOptions = {
  body?: unknown;
  headers?: Record<string, string>;
};

async function getAuthToken(): Promise<string | null> {
  const clerk = (window as any).Clerk;
  if (clerk?.session) {
    return clerk.session.getToken();
  }
  return null;
}

async function request<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
  const token = await getAuthToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: { message: res.statusText } }));
    throw new Error(errorData.error?.message || `Request failed: ${res.status}`);
  }

  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body: unknown) => request<T>("POST", path, { body }),
  put: <T>(path: string, body: unknown) => request<T>("PUT", path, { body }),
  del: <T>(path: string) => request<T>("DELETE", path),
};
