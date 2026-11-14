import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import NuevoCliente from './NuevoCliente';
import NuevaFactura from './NuevaFactura';
import Productos from './Productos';
import HistorialFacturas from './HistorialFacturas';
import ConstructorVisual from './ConstructorVisual';
import VistaPreviaFactura from './VistaPreviaFactura';
import DetalleFactura from './DetalleFactura';
import FacturaPublica from './FacturaPublica';

const RutaProtegida = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
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

      <Route path="/plantillas/constructor" element={
        <RutaProtegida>
          <ConstructorVisual />
        </RutaProtegida>
      } />
      
      <Route path="/facturas/historial" element={
        <RutaProtegida>
          <HistorialFacturas />
        </RutaProtegida>
      } />

      {/* RUTA PARA VER DETALLE Y COBRAR FACTURA */}
      <Route path="/factura/:id" element={
        <RutaProtegida>
          <DetalleFactura />
        </RutaProtegida>
      } />

      {/* RUTA PARA VISTA PREVIA / PDF */}
      <Route path="/facturas/:id/imprimir" element={
        <RutaProtegida>
          <VistaPreviaFactura />
        </RutaProtegida>
      } />

      <Route path="/ver-factura/:id" element={<FacturaPublica />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}