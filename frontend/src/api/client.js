const BASE = '/api';
const getToken = () => localStorage.getItem('token');

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  auth: {
    register: (d) => request('POST', '/auth/register', d),
    login: (d) => request('POST', '/auth/login', d),
    me: () => request('GET', '/auth/me'),
  },
  users: { list: () => request('GET', '/users') },
  projects: {
    list: () => request('GET', '/projects'),
    get: (id) => request('GET', `/projects/${id}`),
    create: (d) => request('POST', '/projects', d),
    update: (id, d) => request('PUT', `/projects/${id}`, d),
    delete: (id) => request('DELETE', `/projects/${id}`),
  },
  tasks: {
    list: (pid) => request('GET', `/tasks${pid ? '?project_id='+pid : ''}`),
    create: (d) => request('POST', '/tasks', d),
    update: (id, d) => request('PUT', `/tasks/${id}`, d),
    delete: (id) => request('DELETE', `/tasks/${id}`),
  },
};
