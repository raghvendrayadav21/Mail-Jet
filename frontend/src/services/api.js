import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
});

// Automatically inject JWT Bearer Token into headers if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const registerUser = async (fullName, email, password, accountType) => {
  try {
    const response = await api.post('/auth/register', {
      fullName,
      email,
      password,
      accountType,
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Registration failed. Please try again.';
    throw new Error(message);
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    return response.data; // contains token and user object
  } catch (error) {
    const message = error.response?.data?.message || 'Login failed. Please verify your credentials.';
    throw new Error(message);
  }
};

export const generateEmailResponse = async (emailContent, userName) => {
  try {
    const response = await api.post('/emails/generate', {
      emailContent,
      userName,
    });
    return response.data;
  } catch (error) {
    console.error('Error generating email response:', error);
    const message = error.response?.data?.message || 'Failed to generate response. Please try again.';
    throw new Error(message);
  }
};

export const sendChatMessage = async (message, history) => {
  try {
    const response = await api.post('/chat/send', {
      message,
      history,
    });
    return response.data;
  } catch (error) {
    console.error('Error sending chat message:', error);
    const message = error.response?.data?.message || 'Failed to get a response from assistant.';
    throw new Error(message);
  }
};

export const connectGmailMock = async () => {
  try {
    const response = await api.post('/gmail/connect-mock');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to connect Gmail in Mock Mode.';
    throw new Error(message);
  }
};

export const saveGmailCredentials = async (clientId, clientSecret) => {
  try {
    const response = await api.post('/gmail/save-credentials', {
      clientId,
      clientSecret,
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to save Google credentials.';
    throw new Error(message);
  }
};

export const getGmailConfigStatus = async () => {
  try {
    const response = await api.get('/gmail/config-status');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch Gmail configuration status.';
    throw new Error(message);
  }
};

export const getGmailAuthUrl = async () => {
  try {
    const response = await api.get('/gmail/auth-url');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to generate Google authorization URL.';
    throw new Error(message);
  }
};

export const connectGmailReal = async (code) => {
  try {
    const response = await api.post('/gmail/callback', { code });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to authenticate authorization code with Google.';
    throw new Error(message);
  }
};

export const disconnectGmail = async () => {
  try {
    const response = await api.post('/gmail/disconnect');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to disconnect Gmail.';
    throw new Error(message);
  }
};

export const getGmailFeed = async () => {
  try {
    const response = await api.get('/gmail/feed');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch Gmail feed.';
    throw new Error(message);
  }
};

export const sendGmailReply = async (emailId, replyText) => {
  try {
    const response = await api.post('/gmail/send-reply', {
      emailId,
      replyText,
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to send Gmail reply.';
    throw new Error(message);
  }
};

// ── Email History & Stats ──────────────────────────────────────────────────
export const getEmailHistory = async () => {
  try {
    const response = await api.get('/emails/history');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch email history.');
  }
};

export const getEmailStats = async () => {
  try {
    const response = await api.get('/emails/stats');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch stats.');
  }
};

// ── Templates ─────────────────────────────────────────────────────────────
export const getTemplates = async () => {
  try {
    const response = await api.get('/templates');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch templates.');
  }
};

export const createTemplate = async (name, content) => {
  try {
    const response = await api.post('/templates', { name, content });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create template.');
  }
};

export const deleteTemplate = async (id) => {
  try {
    await api.delete(`/templates/${id}`);
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete template.');
  }
};

// ── Profile ───────────────────────────────────────────────────────────────
export const getProfile = async () => {
  try {
    const response = await api.get('/auth/profile');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch profile.');
  }
};

export const updateProfile = async (fullName, accountType) => {
  try {
    const response = await api.put('/auth/profile', { fullName, accountType });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update profile.');
  }
};

export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await api.put('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to change password.');
  }
};

export default api;
