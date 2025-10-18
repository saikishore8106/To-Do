// api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000'; // Adjust to your FastAPI backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for error handling
api.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const getAllTodos = () => api.get('/todos');
export const getTodo = (id) => api.get(`/todos/${id}`);
export const createTodo = (todoData) => api.post('/todos', todoData);
export const updateTodo = (id, todoData) => api.put(`/todos/${id}`, todoData);
export const deleteTodo = (id) => api.delete(`/todos/${id}`);

export default api;