export const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

function toUrl(path) {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  if (!API_BASE) return path;
  return `${API_BASE}${path}`;
}

async function request(path, options = {}) {
  const res = await fetch(toUrl(path), {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    credentials: "include"
  });

  if (res.status === 204) return null;
  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await res.json() : await res.text();

  if (!res.ok) {
    const message = typeof data === "string" ? data : data?.error || "Request failed";
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  me: () => request("/api/auth/me"),
  logout: () => request("/api/auth/logout", { method: "POST" }),
  updateMe: (payload) => request("/api/me", { method: "PUT", body: JSON.stringify(payload) }),

  listTodos: (status) => request(`/api/todos?status=${encodeURIComponent(status)}`),
  createTodo: (payload) => request("/api/todos", { method: "POST", body: JSON.stringify(payload) }),
  updateTodo: (id, payload) => request(`/api/todos/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  toggleTodo: (id) => request(`/api/todos/${id}/toggle`, { method: "PATCH" }),
  deleteTodo: (id) => request(`/api/todos/${id}`, { method: "DELETE" })
};
