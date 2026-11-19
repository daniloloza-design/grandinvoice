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
import Registro from './components/Registro';

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
    localStorage.removeItem('usuario');
    window.location.href = '/login';
  };

  return (
    <Routes>
      {/* RUTAS PÚBLICAS */}
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/ver-factura/:id" element={<FacturaPublica />} />

      {/* RUTAS PROTEGIDAS POR TOKEN */}
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

      <Route path="/factura/:id" element={
        <RutaProtegida>
          <DetalleFactura />
        </RutaProtegida>
      } />

      <Route path="/facturas/:id/imprimir" element={
        <RutaProtegida>
          <VistaPreviaFactura />
        </RutaProtegida>
      } />

      {/* REDIRECCIÓN POR DEFECTO */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}