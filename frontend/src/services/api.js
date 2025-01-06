import axios from 'axios';

// Log the value of the environment variable
console.log('API URL:', process.env.REACT_APP_API_URL);

// Set the base URL for Axios
const url = process.env.REACT_APP_API_URL || "http://localhost:4000";

const api = axios.create({
  baseURL: `https://mern-ecom-6pp1-wg85.vercel.app/api/v1`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export { api };