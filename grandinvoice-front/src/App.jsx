import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import NuevoCliente from './NuevoCliente';
import NuevaFactura from './NuevaFactura';
import Productos from './Productos'; // <-- 1. Importamos el nuevo archivo aquí

const RutaProtegida = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  // Función de salida utilizando recarga limpia del navegador
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={
        <RutaProtegida>
          <Dashboard onLogout={handleLogout} />
        </RutaProtegida>
      } />
      
      <Route path="/clientes/nuevo" element={
        <RutaProtegida>
          <NuevoCliente />
        </RutaProtegida>
      } />

      {/* 2. Agregamos la ruta protegida de los productos */}
      <Route path="/productos" element={
        <RutaProtegida>
          <Productos onLogout={handleLogout} />
        </RutaProtegida>
      } />
      
      <Route path="/facturas/nueva" element={
        <RutaProtegida>
          <NuevaFactura />
        </RutaProtegida>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}