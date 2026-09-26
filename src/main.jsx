import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import axios from 'axios' // Import axios
import store from './store/store'
import './index.css'
import App from './App.jsx'

// Set the base URL for all axios requests
axios.defaults.baseURL = 'https://zeba-royal-backend.onrender.com';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
