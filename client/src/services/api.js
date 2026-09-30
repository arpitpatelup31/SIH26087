// Centralized API client for CoopConnect LMS

const API_BASE = '/api';

export const getAuthToken = () => {
  return localStorage.getItem('coop_token');
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('coop_token', token);
  } else {
    localStorage.removeItem('coop_token');
  }
};

export const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }

    return data;
  } catch (err) {
    // If network error and user has offline queue enabled, forward or throw
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
};

// API Endpoints
export const authApi = {
  login: (email, password) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (userData) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => apiRequest('/auth/me'),
  getDemoAccounts: () => apiRequest('/auth/demo-accounts'),
};

export const coursesApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/courses${query ? `?${query}` : ''}`);
  },
  getById: (id) => apiRequest(`/courses/${id}`),
  enroll: (courseId) => apiRequest('/enrollments', { method: 'POST', body: JSON.stringify({ courseId }) }),
  getMyCourses: () => apiRequest('/enrollments/my-courses'),
};

export const lessonsApi = {
  getById: (id) => apiRequest(`/lessons/${id}`),
  complete: (id) => apiRequest(`/lessons/${id}/complete`, { method: 'POST' }),
};

export const quizzesApi = {
  getById: (id) => apiRequest(`/quizzes/${id}`),
  submit: (id, answers) => apiRequest(`/quizzes/${id}/submit`, { method: 'POST', body: JSON.stringify({ answers }) }),
};

export const aiApi = {
  getUserSkills: (userId) => apiRequest(userId ? `/users/${userId}/skills` : '/ai/skills'),
  getRecommendations: (userId) => apiRequest(userId ? `/users/${userId}/recommendations` : '/ai/recommendations'),
  analyzeSkillsDirect: (data) => apiRequest('/ai/analyze-skills', { method: 'POST', body: JSON.stringify(data) }),
};

export const certificatesApi = {
  getMyCertificates: () => apiRequest('/certificates/my-certificates'),
  getById: (id) => apiRequest(`/certificates/${id}`),
  verify: (query) => apiRequest(`/certificates/verify/${query}`),
};

export const trainerApi = {
  getStats: () => apiRequest('/trainer/stats'),
  createCourse: (courseData) => apiRequest('/trainer/courses', { method: 'POST', body: JSON.stringify(courseData) }),
  addModule: (courseId, moduleData) => apiRequest(`/trainer/courses/${courseId}/modules`, { method: 'POST', body: JSON.stringify(moduleData) }),
  addLesson: (moduleId, lessonData) => apiRequest(`/trainer/modules/${moduleId}/lessons`, { method: 'POST', body: JSON.stringify(lessonData) }),
  createQuiz: (courseId, quizData) => apiRequest(`/trainer/courses/${courseId}/quizzes`, { method: 'POST', body: JSON.stringify(quizData) }),
  getLearners: (courseId) => apiRequest(`/trainer/courses/${courseId}/learners`),
};

export const adminApi = {
  getAnalytics: () => apiRequest('/admin/analytics'),
  getUsers: () => apiRequest('/admin/users'),
  updateUserRole: (userId, roleId) => apiRequest(`/admin/users/${userId}/role`, { method: 'PATCH', body: JSON.stringify({ roleId }) }),
};

export const syncApi = {
  sendBatch: (batch, deviceId) => apiRequest('/sync/batch', { method: 'POST', body: JSON.stringify({ batch, deviceId }) }),
  getStatus: () => apiRequest('/sync/status'),
};
