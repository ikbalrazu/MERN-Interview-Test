import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx';
import axios from 'axios';

// axios.defaults.baseURL = "http://localhost:5000/api/v1";

axios.defaults.baseURL = "https://mern-interview-test-6hxi.onrender.com/api/v1";

createRoot(document.getElementById('root')).render(
    <App />
)
