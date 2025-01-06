import axios from 'axios';
const url = process.env.REACT_APP_API_URL || "http://localhost:4000";

const api = axios.create({
  baseURL: `${url}/api/v1`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export { api };
