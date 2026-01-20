import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://placement-prepration-backend.onrender.com/api/v1';
// const API_BASE_URL = 'http://localhost:8000/api/v1';
// 
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to add the token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('InterPrepaccessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Auth APIs
export const authAPI = {
    login: async (email, password) => {
        const response = await api.post('/users/login', { email, password });
        return response.data;
    },

    signup: async (userData) => {
        const response = await api.post('/users/create', userData);
        return response.data;
    },

    googleLogin: async (accessToken) => {
        const response = await api.post('/users/google-login', { accessToken });
        return response.data;
    },

    googleSignup: async (accessToken) => {
        const response = await api.post('/users/google-signup', { accessToken });
        return response.data;
    },
};

// User APIs
export const userAPI = {
    getUser: async (userid) => {
        const response = await api.get(`/users/user/${userid}`);
        return response.data;
    },

    editUser: async (userid, updateData) => {
        const response = await api.put(`/users/edit-user/${userid}`, updateData);
        return response.data;
    },

    connectGithub: async (code, userId) => {
        const response = await api.post('/users/connect-github', { code, userId });
        return response.data;
    },

    disconnectGithub: async (userid) => {
        const response = await api.post(`/users/disconnect-github/${userid}`);
        return response.data;
    },

    getGithubRepos: async (userid) => {
        const response = await api.get(`/users/github-repos/${userid}`);
        return response.data;
    },

    getUserPublic: async (userid) => {
        const response = await api.get(`/users/public/${userid}`);
        return response.data;
    },
};

// Interview APIs
export const interviewAPI = {
    createSession: async (sessionData) => {
        const response = await api.post('/interviews/create', sessionData);
        return response.data;
    },

    getSession: async (sessionId) => {
        const response = await api.get(`/interviews/session/${sessionId}`);
        return response.data;
    },

    getUserSessions: async (userid) => {
        const response = await api.get(`/interviews/user/${userid}`);
        return response.data;
    },

    startInterview: async (sessionId) => {
        const response = await api.post(`/interviews/start/${sessionId}`);
        return response.data;
    },

    chatWithAI: async (sessionId, message) => {
        const response = await api.post(`/interviews/chat/${sessionId}`, { message });
        return response.data;
    },

    saveTranscription: async (sessionId, transcriptionData) => {
        const response = await api.post(`/interviews/transcription/${sessionId}`, transcriptionData);
        return response.data;
    },

    endInterview: async (sessionId, feedback) => {
        const response = await api.post(`/interviews/end/${sessionId}`, { feedback });
        return response.data;
    },

    getGeminiKey: async () => {
        const response = await api.get('/interviews/gemini-key');
        return response.data;
    },
};

// Plan APIs
export const planAPI = {
    createPlan: async (planData) => {
        const response = await api.post('/plans/createplan', planData);
        return response.data;
    },

    savePlan: async (payload, plan) => {
        const response = await api.post('/plans/saveplan', { payload, plan });
        return response.data;
    },

    getMyAllPlans: async () => {
        const response = await api.get('/plans/getmyallplan');
        return response.data;
    },

    getPlanDetails: async (id) => {
        const response = await api.get(`/plans/getplandetails/${id}`);
        return response.data;
    },

    getScheduleTasks: async () => {
        const response = await api.get('/plans/getscheduletasks');
        return response.data;
    },

    updateTaskCompletion: async (planId, taskData) => {
        const response = await api.put(`/plans/updatetask/${planId}`, taskData);
        return response.data;
    },

    markTaskComplete: async (taskData) => {
        const response = await api.post('/plans/markcomplete', taskData);
        return response.data;
    },
};

export default api;

