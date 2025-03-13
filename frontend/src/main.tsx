import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './components/App';
import { Toaster } from 'react-hot-toast';
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
     <Toaster position="top-right" />
    <App />
  </React.StrictMode>
);