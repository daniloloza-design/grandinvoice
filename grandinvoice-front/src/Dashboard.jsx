import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard({ onLogout }) {
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [clienteEditando, setClienteEditando] = useState(null); 
  const [mostrarModalConfig, setMostrarModalConfig] = useState(false); // 👈 ESTADO AGREGADO
  const navigate = useNavigate();

  const cargarClientes = async () => {
    try {
      const token = localStorage.getItem('token');
      const respuesta = await fetch('http://localhost:5000/api/clientes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await respuesta.json();
      
      if (respuesta.ok && data.status === 'success') {
        setClientes(data.data);
      }
    } catch (error) {
      console.error('Error de conexión al cargar el tablero:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  const eliminarCliente = async (id, nombre) => {
    const confirmar = window.confirm(`⚠️ ¿Estás seguro de que deseas eliminar permanentemente a la empresa "${nombre}"?\nEsta acción no se puede deshacer.`);
    if (!confirmar) return; 

    try {
      const token = localStorage.getItem('token');
      const respuesta = await fetch(`http://localhost:5000/api/clientes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await respuesta.json();
      
      if (respuesta.ok && data.status === 'success') {
        setClientes(clientes.filter(cliente => cliente.id !== id));
      } else {
        alert('Error al eliminar: ' + data.message);
      }
    } catch (error) {
      console.error('Error al intentar eliminar:', error);
      alert('Hubo un problema al conectar con el servidor.');
    }
  };

  const guardarCambios = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const respuesta = await fetch(`http://localhost:5000/api/clientes/${clienteEditando.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(clienteEditando)
      });
      const data = await respuesta.json();
      
      if (respuesta.ok && data.status === 'success') {
        setClienteEditando(null);
        cargarClientes();
      } else {
        alert('Error al actualizar: ' + data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión con el servidor.');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Cabecera del Tablero */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ color: '#2c3e50', margin: '0 0 0.5rem 0', fontSize: '2.2rem' }}>Directorio de Clientes</h1>
          <p style={{ margin: 0, color: '#7f8c8d', fontWeight: '500' }}>Panel de gestión y facturación</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button 
            onClick={() => navigate('/clientes/nuevo')}
            style={{ background: '#3498db', color: '#fff', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(52, 152, 219, 0.3)' }}
          >
            + Nuevo Cliente
          </button>

          <button 
            onClick={() => navigate('/productos')}
            style={{ background: '#8e44ad', color: '#fff', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(142, 68, 173, 0.3)' }}
          >
            📦 Catálogo
          </button>

          <button 
            onClick={() => navigate('/facturas/nueva')}
            style={{ background: '#27ae60', color: '#fff', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(39, 174, 96, 0.3)' }}
          >
            🧾 Emitir Factura
          </button>

          <button 
            onClick={() => navigate('/facturas/historial')}
            style={{ background: '#34495e', color: '#fff', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(52, 73, 94, 0.3)' }}
          >
            📊 Historial Finanzas
          </button>

          <button 
            onClick={() => navigate('/plantillas/constructor')}
            style={{ background: '#34495e', color: '#fff', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(52, 73, 94, 0.3)' }}
          >
            🎨 Diseño Visual
          </button>

          <button 
            onClick={() => setMostrarModalConfig(true)}
            style={{ backgroundColor: '#2c3e50', color: '#fff', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            ⚙️ Configuración
          </button>

          <button 
            onClick={onLogout}
            style={{ background: '#e74c3c', color: '#fff', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(231, 76, 60, 0.3)' }}
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Tablero Grid */}
      {cargando ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#7f8c8d', fontWeight: 'bold', fontSize: '1.2rem' }}>
          Cargando directorio... ⏳
        </div>
      ) : clientes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#f8f9fa', borderRadius: '20px', border: '2px dashed #bdc3c7' }}>
          <h3 style={{ color: '#34495e', fontSize: '1.5rem', margin: '0 0 1rem 0' }}>Tablero vacío</h3>
          <p style={{ color: '#7f8c8d', margin: 0 }}>Comienza agregando tu primer cliente para llenar esta sección.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {clientes.map(cliente => (
            <div key={cliente.id} style={{ 
              background: '#ffffff', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
              border: '2px solid #ecf0f1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 12px 25px rgba(0,0,0,0.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.06)'; }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: '#2c3e50', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
                    {cliente.nombre ? cliente.nombre.charAt(0).toUpperCase() : 'C'}
                  </div>
                  <h3 style={{ margin: 0, color: '#2c3e50', fontSize: '1.25rem', lineHeight: '1.2' }}>
                    {cliente.nombre}
                  </h3>
                </div>
                
                <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem' }}>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#555', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    📧 <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cliente.email}</span>
                  </p>
                  <p style={{ margin: 0, color: '#555', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    📱 {cliente.telefono}
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <button 
                  onClick={() => setClienteEditando(cliente)}
                  style={{ background: '#f39c12', color: '#fff', border: 'none', padding: '0.8rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }}
                >
                  Editar ✏️
                </button>
                <button 
                  onClick={() => eliminarCliente(cliente.id, cliente.nombre)}
                  style={{ background: '#fff', color: '#e74c3c', border: '2px solid #e74c3c', padding: '0.8rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  Eliminar 🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL FLOTANTE DE EDICIÓN */}
      {clienteEditando && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '450px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginTop: 0, color: '#2c3e50', fontSize: '1.5rem', marginBottom: '1.5rem' }}>Editar Cliente</h3>
            
            <form onSubmit={guardarCambios} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#7f8c8d', fontSize: '0.9rem' }}>Nombre o Empresa</label>
                <input type="text" value={clienteEditando.nombre} onChange={(e) => setClienteEditando({...clienteEditando, nombre: e.target.value})} required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #bdc3c7', boxSizing: 'border-box' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#7f8c8d', fontSize: '0.9rem' }}>Correo Electrónico</label>
                <input type="email" value={clienteEditando.email} onChange={(e) => setClienteEditando({...clienteEditando, email: e.target.value})} required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #bdc3c7', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#7f8c8d', fontSize: '0.9rem' }}>Teléfono</label>
                <input type="text" value={clienteEditando.telefono} onChange={(e) => setClienteEditando({...clienteEditando, telefono: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #bdc3c7', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                <button type="submit" style={{ flex: 1, background: '#27ae60', color: '#fff', padding: '0.8rem', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Guardar Cambios
                </button>
                <button type="button" onClick={() => setClienteEditando(null)} style={{ flex: 1, background: '#95a5a6', color: '#fff', padding: '0.8rem', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIGURACIÓN Y BAJA DE CUENTA (AHORA DENTRO DEL RETURN) */}
      {mostrarModalConfig && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#1a192b',
            padding: '30px',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '450px',
            border: '1px solid #ff007f',
            color: '#fff'
          }}>
            <h2 style={{ color: '#00f0ff', marginTop: 0 }}>⚙️ Configuración de la Cuenta</h2>
            
            <p style={{ fontSize: '0.9rem', color: '#ccc' }}>
              Administra los ajustes de tu cuenta corporativa o da de baja tu ecosistema.
            </p>

            <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '20px 0' }} />

            <div style={{ backgroundColor: 'rgba(255, 0, 80, 0.1)', border: '1px solid #ff0050', padding: '15px', borderRadius: '8px' }}>
              <h4 style={{ color: '#ff4d4d', margin: '0 0 10px 0' }}>⚠️ Zona Peligrosa</h4>
              <p style={{ fontSize: '0.8rem', color: '#ffb3b3', margin: '0 0 15px 0' }}>
                Esta acción eliminará permanentemente tu empresa, clientes, facturas e historial de Banahosting.
              </p>
              
              <button
                onClick={async () => {
                  if (window.confirm('¿Estás COMPLETAMENTE seguro de dar de baja tu cuenta? Esta acción borrará todos tus datos y no se puede deshacer.')) {
                    try {
                      const token = localStorage.getItem('token');
                      const res = await fetch('http://localhost:5000/api/usuarios/me', {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                      });
                      const data = await res.json();
                      if (res.ok) {
                        alert('Tu cuenta ha sido eliminada correctamente.');
                        localStorage.clear();
                        window.location.href = '/login';
                      } else {
                        alert(data.message || 'Error al eliminar la cuenta');
                      }
                    } catch (err) {
                      alert('Error al conectar con el servidor');
                    }
                  }
                }}
                style={{
                  width: '100%',
                  backgroundColor: '#ff0050',
                  color: '#fff',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                🗑️ Eliminar Cuenta Definitivamente
              </button>
            </div>

            <button
              onClick={() => setMostrarModalConfig(false)}
              style={{
                marginTop: '20px',
                width: '100%',
                backgroundColor: '#333',
                color: '#fff',
                border: 'none',
                padding: '10px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}