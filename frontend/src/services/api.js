import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle unauthenticated responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  sendOtp: (data) => apiClient.post('/auth/send-otp', data),
  verifyOtp: (data) => apiClient.post('/auth/verify-otp', data),
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  getMe: () => apiClient.get('/auth/me'),
  logout: () => apiClient.post('/auth/logout'),
};

// Users
export const usersApi = {
  getUser: (id) => apiClient.get(`/users/${id}`),
  updateProfile: (id, data) => apiClient.patch(`/users/${id}`, data),
  getAcademic: (id) => apiClient.get(`/users/${id}/academic`),
  updateAcademic: (id, data) => apiClient.patch(`/users/${id}/academic`, data),
  getContributions: (id) => apiClient.get(`/users/${id}/contributions`),
  getStreak: (id) => apiClient.get(`/users/${id}/streak`),
};

// Batches
export const batchesApi = {
  listBatches: (params) => apiClient.get('/batches', { params }),
  getBatch: (id) => apiClient.get(`/batches/${id}`),
  createBatch: (data) => apiClient.post('/batches', data),
  updateBatch: (id, data) => apiClient.patch(`/batches/${id}`, data),
  deleteBatch: (id) => apiClient.delete(`/batches/${id}`),
  getStudents: (id) => apiClient.get(`/batches/${id}/students`),
};

// Corres
export const corresApi = {
  getMyCorres: () => apiClient.get('/corres/my'),
  getMyJuniors: () => apiClient.get('/corres/my-juniors'),
  runAssignment: (data) => apiClient.post('/corres/assign', data),
  runBatchAssignment: (batchId) => apiClient.post(`/corres/assign/${batchId}`),
  listAssignments: (params) => apiClient.get('/corres/assignments', { params }),
  getAssignment: (id) => apiClient.get(`/corres/${id}`),
  updateAssignment: (id, data) => apiClient.patch(`/corres/${id}`, data),
};

// Lineage
export const lineageApi = {
  getMyLineage: () => apiClient.get('/lineage/me'),
  getUserLineage: (userId) => apiClient.get(`/lineage/${userId}`),
  getLineageResources: (userId) => apiClient.get(`/lineage/${userId}/resources`),
  getLineageContributions: (userId) => apiClient.get(`/lineage/${userId}/contributions`),
  getLineageOverview: (userId) => apiClient.get(`/lineage/${userId}/overview`),
};

// Resources
export const resourcesApi = {
  listResources: (params) => apiClient.get('/resources', { params }),
  getResource: (id) => apiClient.get(`/resources/${id}`),
  createResource: (data) => apiClient.post('/resources', data),
  uploadFile: (id, formData) =>
    apiClient.post(`/resources/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateResource: (id, data) => apiClient.patch(`/resources/${id}`, data),
  deleteResource: (id) => apiClient.delete(`/resources/${id}`),
  getDownload: (id) => apiClient.get(`/resources/${id}/download`),
  saveResource: (id) => apiClient.post(`/resources/${id}/save`),
  unsaveResource: (id) => apiClient.delete(`/resources/${id}/save`),
  getSavedResources: () => apiClient.get('/resources/saved/me'),
};

// Q&A
export const qaApi = {
  listQuestions: (params) => apiClient.get('/questions', { params }),
  getQuestion: (id) => apiClient.get(`/questions/${id}`),
  createQuestion: (data) => apiClient.post('/questions', data),
  updateQuestion: (id, data) => apiClient.patch(`/questions/${id}`, data),
  deleteQuestion: (id) => apiClient.delete(`/questions/${id}`),
  addAnswer: (questionId, data) => apiClient.post(`/questions/${questionId}/answers`, data),
  updateAnswer: (id, data) => apiClient.patch(`/questions/answers/${id}`, data),
  deleteAnswer: (id) => apiClient.delete(`/questions/answers/${id}`),
  acceptAnswer: (id) => apiClient.post(`/questions/answers/${id}/accept`),
};

// Chat
export const chatApi = {
  listConversations: () => apiClient.get('/conversations'),
  getConversation: (id) => apiClient.get(`/conversations/${id}`),
  getMessages: (id, params) => apiClient.get(`/conversations/${id}/messages`, { params }),
  openConversation: (data) => apiClient.post('/conversations', data),
  markRead: (id) => apiClient.post(`/conversations/${id}/read`),
};

// Contributions & Streak
export const contributionsApi = {
  createContribution: (data) => apiClient.post('/contributions', data),
  getMyContributions: () => apiClient.get('/contributions/me'),
  listContributions: (params) => apiClient.get('/contributions', { params }),
};

export const streakApi = {
  getMyStreak: () => apiClient.get('/streak/me'),
  getUserStreak: (userId) => apiClient.get(`/streak/${userId}`),
};

// Notifications
export const notificationsApi = {
  listNotifications: (params) => apiClient.get('/notifications', { params }),
  markRead: (id) => apiClient.patch(`/notifications/${id}/read`),
  markAllRead: () => apiClient.patch('/notifications/read-all'),
  deleteNotification: (id) => apiClient.delete(`/notifications/${id}`),
  registerDevice: (data) => apiClient.post('/notifications/register-device', data),
};

// Admin
export const adminApi = {
  listUsers: (params) => apiClient.get('/admin/users', { params }),
  updateStatus: (id, data) => apiClient.patch(`/admin/users/${id}/status`, data),
  verifyUser: (id) => apiClient.patch(`/admin/users/${id}/verify`),
  deleteUser: (id) => apiClient.delete(`/admin/users/${id}`),
  getReportedResources: () => apiClient.get('/admin/resources/reported'),
  getReportedQuestions: () => apiClient.get('/admin/questions/reported'),
  getReportedChat: () => apiClient.get('/admin/chat/reported'),
  moderateResource: (id, data) => apiClient.patch(`/admin/resources/${id}/moderate`, data),
  moderateQuestion: (id, data) => apiClient.patch(`/admin/questions/${id}/moderate`, data),
  moderateAnswer: (id, data) => apiClient.patch(`/admin/answers/${id}/moderate`, data),
};

// Dashboard
export const dashboardApi = {
  getStudentDashboard: () => apiClient.get('/dashboard/student'),
  getSeniorDashboard: () => apiClient.get('/dashboard/senior'),
  getAdminDashboard: () => apiClient.get('/dashboard/admin'),
};

// Search
export const searchApi = {
  search: (params) => apiClient.get('/search', { params }),
};

export default {
  auth: authApi,
  users: usersApi,
  batches: batchesApi,
  corres: corresApi,
  lineage: lineageApi,
  resources: resourcesApi,
  qa: qaApi,
  chat: chatApi,
  contributions: contributionsApi,
  streak: streakApi,
  notifications: notificationsApi,
  admin: adminApi,
  dashboard: dashboardApi,
  search: searchApi,
};

