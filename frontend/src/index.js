import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ChakraProvider } from '@chakra-ui/react';
import axios from 'axios';

axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('authToken');
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
    if (token && config.url && config.url.startsWith(apiBaseUrl)) {
      config.headers['Authorization'] = `Token ${token}`;
    }
    return config;
  },
  error => {
    console.error("Erro no interceptador de request do Axios:", error);
    return Promise.reject(error);
  }
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
     <BrowserRouter>
       <ChakraProvider>
         <AuthProvider>
           <App />
         </AuthProvider>
       </ChakraProvider>
     </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
