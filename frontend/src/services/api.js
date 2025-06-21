import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_URL,
});

// You can add an interceptor to include the auth token if needed
// api.interceptors.request.use(async (config) => {
//   const token = await window.Clerk.session.getToken({ template: 'supabase' });
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

export const getDisasters = (tag) => api.get('/disasters', { params: { tag } });
export const createDisaster = (data) => api.post('/disasters', data);
export const updateDisaster = (id, data) => api.put(`/disasters/${id}`, data);
export const deleteDisaster = (id) => api.delete(`/disasters/${id}`);

export const geocode = (location_text) => api.post('/geocode', { location_text });

export const getSocialMedia = (id) => api.get(`/disasters/${id}/social-media`);
export const getNearbyResources = (id, lat, lon) => api.get(`/disasters/${id}/resources`, { params: { lat, lon } });
export const getOfficialUpdates = (id) => api.get(`/disasters/${id}/official-updates`);
export const verifyImage = (id, image_url) => api.post(`/disasters/${id}/verify-image`, { image_url });

// Add other API functions for reports and resources as needed 