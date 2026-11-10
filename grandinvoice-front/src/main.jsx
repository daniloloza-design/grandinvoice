import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // <-- 1. Importamos la carretera
import App from './App.jsx';
// (Aquí pueden estar tus importaciones de CSS)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. Envolvemos toda la aplicación */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)