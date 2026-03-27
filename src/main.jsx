import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios' // Import axios
import './index.css'
import App from './App.jsx'

// Set the base URL for all axios requests
axios.defaults.baseURL = 'https://zeba-royal-backend.onrender.com';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

