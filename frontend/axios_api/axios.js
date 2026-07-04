import axios from "axios";

const api = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true // Crucial: automatically includes cookies in request/response headers
});

export default api;