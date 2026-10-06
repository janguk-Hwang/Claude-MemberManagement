import axios from 'axios';

export const checkName = (name) =>
  axios.get('/api/auth/check-name', { params: { name } }).then((r) => r.data);

export const signup = (payload) => axios.post('/api/auth/signup', payload).then((r) => r.data);

export const fetchMembers = (name, page, size) =>
  axios.get('/api/members', { params: { ...(name ? { name } : {}), page, size } }).then((r) => r.data);

export const updateMember = (id, payload) =>
  axios.put(`/api/members/${id}`, payload).then((r) => r.data);

export const deleteMember = (id) => axios.delete(`/api/members/${id}`);
