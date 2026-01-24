import api from './api';

// Auth API
export const authAPI = {
    register: (data: { name: string; email: string; password: string }) =>
        api.post('/auth/register', data),
    login: (data: { email: string; password: string }) =>
        api.post('/auth/login', data),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (data: any) => api.put('/auth/profile', data),
};

// Problems API
export const problemsAPI = {
    getAll: (params: any = {}) => api.get('/problems', { params }),
    getById: (id: string) => api.get(`/problems/${id}`),
    create: (data: any) => api.post('/problems', data),
    bulkImport: (data: any) => api.post('/problems/bulk-import', data),
    update: (id: string, data: any) => api.put(`/problems/${id}`, data),
    delete: (id: string) => api.delete(`/problems/${id}`),
};

// Sheets API
export const sheetsAPI = {
    getAll: () => api.get('/sheets'),
    getById: (id: string) => api.get(`/sheets/${id}`),
    create: (data: any) => api.post('/sheets', data),
    update: (id: string, data: any) => api.put(`/sheets/${id}`, data),
    delete: (id: string) => api.delete(`/sheets/${id}`),
};

// Progress API
export const progressAPI = {
    getAll: () => api.get('/progress'),
    markSolved: (data: any) => api.post('/progress/solve', data),
    update: (id: string, data: any) => api.put(`/progress/${id}`, data),
    getStats: (params: any = {}) => api.get('/progress/stats', { params }),
};

// Revision API
export const revisionAPI = {
    getSchedule: (params: any = {}) => api.get('/revision', { params }),
    getOverdue: () => api.get('/revision/overdue'),
    getStats: () => api.get('/revision/stats'),
    markComplete: (id: string) => api.put(`/revision/${id}/complete`),
    delete: (id: string) => api.delete(`/revision/${id}`),
};

// Notes API
export const notesAPI = {
    getAll: (params: any = {}) => api.get('/notes', { params }),
    getById: (id: string) => api.get(`/notes/${id}`),
    create: (data: any) => api.post('/notes', data),
    update: (id: string, data: any) => api.put(`/notes/${id}`, data),
    delete: (id: string) => api.delete(`/notes/${id}`),
};

// Analytics API
export const analyticsAPI = {
    getTopicStrength: (params: any = {}) => api.get('/analytics/topic-strength', { params }),
    getTimeDistribution: () => api.get('/analytics/time-distribution'),
    getConsistency: (params: any = {}) => api.get('/analytics/consistency', { params }),
    getPlatformStats: () => api.get('/analytics/platform-stats'),
    getInsights: (params: any = {}) => api.get('/analytics/insights', { params }),
};

export const adminAPI = {
    getStats: () => api.get('/admin/stats'),
    getUsers: () => api.get('/admin/users'),
    updateRole: (userId: string, role: string) => api.put(`/admin/users/${userId}/role`, { role }),
    toggleBlock: (userId: string) => api.put(`/admin/users/${userId}/block`),
    resetProgress: (userId: string) => api.post(`/admin/users/${userId}/reset-progress`),
};

export const dailyAPI = {
    getToday: () => api.get('/daily/today'),
    create: (data: any) => api.post('/daily', data),
    getAll: () => api.get('/daily/all'),
};
