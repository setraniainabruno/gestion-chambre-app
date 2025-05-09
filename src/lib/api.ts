import axios from 'axios';

const api = axios.create({
  // baseURL: 'http://localhost:8090/api'
  baseURL: 'https://gestion-chambre-api.onrender.com/api/'
});

export default api;
