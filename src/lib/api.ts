import axios from 'axios';

const api = axios.create({
    baseURL:'http://localhost:8080',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const loginUser = async (email: string, password: string) => {
  
  const response = await api.post('/abe/login', { email, password });
  return response.data;
};

export const registerUser=async (payload: Record<string, unknown>) => {
  
  const response = await api.post('/abe/register', { payload });
  return response.data;
};

export const getSystemAttributes = async () => {
  
  const response = await api.get('/abe/attributes');
  return response.data;
};

export const getMyAttributes = async () => {
  
  const response = await api.get('/abe/my-attributes');
  return response.data;
};

export const getAllFiles = async () => {
  
  const response = await api.get('/abe/list');
  return response.data;
};

export const getAdminUsers = async () => {
  
  const response = await api.get('/abe/admin/users');
  return response.data;
};

export const getCatalog = async () => {
  const response = await api.get('/abe/attributes');
  return response.data;
};

export const addCatalogAttr = async (name: string) => {
  const response = await api.post('/abe/admin/attributes', {
    name: name,
    description: "Added via Admin Panel"
  });
  return response.data;
};

export const assignUserAttrs = async (userId: number, attributes: string) => {
  const response = await api.post('/abe/admin/assign-attributes', {
    targetUserId: userId,
    attributes: attributes
  });
  return response.data;
};


export const uploadAndEncryptFile = async (file: File, selectedTags: string, base64Key: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('selectedTags', selectedTags);
  formData.append('key', base64Key);
  const response = await api.post('/abe/encrypt-file', formData);
  return response.data;
};


export const downloadFile = async (fileId: string | number) => {
  const response = await api.get(`/abe/download/${fileId}`, {
    responseType: "blob",
  });

  return response;
};