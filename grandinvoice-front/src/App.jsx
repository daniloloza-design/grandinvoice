import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import NuevoCliente from './NuevoCliente';
import NuevaFactura from './NuevaFactura';
import Productos from './Productos';
import HistorialFacturas from './HistorialFacturas';
import ConstructorVisual from './ConstructorVisual'; // <-- 1. Importamos el nuevo archivo aquí

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
      
      {/* 3. Ruta de Nueva Factura independiente */}
      <Route path="/facturas/nueva" element={
        <RutaProtegida>
          <NuevaFactura />
        </RutaProtegida>
      } />

      {/* 4. Ruta de Historial Financiero independiente */}
      <Route path="/plantillas/constructor" element={<RutaProtegida><ConstructorVisual /></RutaProtegida>} />
      <Route path="/facturas/historial" element={
        <RutaProtegida>
          <HistorialFacturas />
        </RutaProtegida>
      } />


      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}