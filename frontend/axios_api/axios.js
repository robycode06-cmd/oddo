import axios from "axios";

const api = axios.create({
    baseURL: 'http://localhost:8000',
    withCredentials: true // Automatically passes cookies between frontend and backend
});

export default api;