import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HistorialFacturas() {
  const [facturas, setFacturas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    cargarFacturas();
  }, []);

  const cargarFacturas = async () => {
    try {
      const token = localStorage.getItem('token');
      // Asumimos que esta ruta está en tu server.js para traer facturas con el nombre del cliente
      const respuesta = await fetch('http://localhost:5000/api/facturas', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await respuesta.json();
      
      if (respuesta.ok && data.status === 'success') {
        setFacturas(data.data);
      }
    } catch (error) {
      console.error('Error cargando el historial:', error);
    } finally {
      setCargando(false);
    }
  };

  const alternarEstado = async (id, estadoActual) => {
    const nuevoEstado = estadoActual === 'Pendiente' ? 'Pagada' : 'Pendiente';
    try {
      const token = localStorage.getItem('token');
      // Ruta para actualizar solo el estado de la factura
      const respuesta = await fetch(`http://localhost:5000/api/facturas/${id}/estado`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });

      const data = await respuesta.json();
      if (respuesta.ok && data.status === 'success') {
        cargarFacturas(); // Recargar para ver el cambio de color
      } else {
        alert('Error al actualizar estado: ' + data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Problema de conexión con el servidor.');
    }
  };

  // Cálculos rápidos para tus finanzas
  const totalCobrado = facturas.filter(f => f.estado === 'Pagada').reduce((acc, f) => acc + parseFloat(f.monto), 0);
  const totalPendiente = facturas.filter(f => f.estado === 'Pendiente').reduce((acc, f) => acc + parseFloat(f.monto), 0);

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: '#2c3e50', margin: '0 0 0.5rem 0' }}>Historial y Finanzas</h1>
          <p style={{ color: '#7f8c8d', margin: 0 }}>Control de pagos y estado de cuenta</p>
        </div>
        <button onClick={() => navigate('/')} style={{ background: '#95a5a6', color: '#fff', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          ⬅ Volver al Tablero
        </button>
      </div>

      {/* Tarjetas de Resumen Financiero */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ flex: 1, background: '#e8f8f5', padding: '1.5rem', borderRadius: '12px', borderLeft: '5px solid #27ae60' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#27ae60' }}>Total Cobrado</h3>
          <h2 style={{ margin: 0, fontSize: '2rem', color: '#2c3e50' }}>${totalCobrado.toFixed(2)}</h2>
        </div>
        <div style={{ flex: 1, background: '#fdf2e9', padding: '1.5rem', borderRadius: '12px', borderLeft: '5px solid #e67e22' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#e67e22' }}>Cuentas por Cobrar</h3>
          <h2 style={{ margin: 0, fontSize: '2rem', color: '#2c3e50' }}>${totalPendiente.toFixed(2)}</h2>
        </div>
      </div>

      {/* Tabla de Facturas */}
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 8px 20px rgba(0,0,0,0.05)', overflow: 'hidden', border: '1px solid #ecf0f1' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#2c3e50', color: '#fff' }}>
            <tr>
              <th style={{ padding: '1rem', textAlign: 'left' }}>No. Factura</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Fecha</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Cliente (ID)</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Monto</th>
              <th style={{ padding: '1rem', textAlign: 'center' }}>Estado</th>
              <th style={{ padding: '1rem', textAlign: 'center' }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Cargando datos... ⏳</td></tr>
            ) : facturas.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>No hay facturas emitidas aún.</td></tr>
            ) : (
              facturas.map((fac) => (
                <tr key={fac.id} style={{ borderBottom: '1px solid #ecf0f1' }}>
                  <td style={{ padding: '1rem', fontWeight: 'bold', color: '#34495e' }}>{fac.numero_factura}</td>
                  <td style={{ padding: '1rem' }}>{new Date(fac.fecha_emision).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem' }}>Cliente #{fac.cliente_id}</td>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>${parseFloat(fac.monto).toFixed(2)}</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <span style={{ 
                      background: fac.estado === 'Pagada' ? '#2ecc71' : '#f1c40f', 
                      color: fac.estado === 'Pagada' ? '#fff' : '#000', 
                      padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' 
                    }}>
                      {fac.estado}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <button 
                      onClick={() => alternarEstado(fac.id, fac.estado)}
                      style={{ 
                        background: fac.estado === 'Pendiente' ? '#27ae60' : '#e74c3c', 
                        color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' 
                      }}
                    >
                      {fac.estado === 'Pendiente' ? 'Marcar Pagada ✔️' : 'Marcar Pendiente ↩️'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}