import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import App from './App';
import { BrowserRouter } from 'react-router-dom'; 
import { AuthProvider } from './pages/InicioSesion/authContext';
import { GoogleOAuthProvider } from '@react-oauth/google';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="343621840150-lnu4i5vhgopg7pt49tr2t8ck0nq5bo2j.apps.googleusercontent.com">
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
