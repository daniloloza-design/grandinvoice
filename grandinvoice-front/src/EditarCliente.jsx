import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function EditarCliente() {
  const navigate = useNavigate();
  const { id } = useParams(); // Atrapamos el ID de la URL
  const [cliente, setCliente] = useState({ nombre: '', email: '', telefono: '' });
  const [mensaje, setMensaje] = useState('Cargando datos del jugador...');

  useEffect(() => {
    const cargarCliente = async () => {
      try {
        const token = localStorage.getItem('token');
        const respuesta = await fetch('http://localhost:5000/api/clientes', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await respuesta.json();
        
        if (respuesta.ok && data.status === 'success') {
          // Filtramos al cliente específico que queremos editar
          const clienteEncontrado = data.data.find(c => c.id.toString() === id);
          if (clienteEncontrado) {
            setCliente(clienteEncontrado);
            setMensaje('');
          } else {
            setMensaje('Ficha de jugador no encontrada.');
          }
        }
      } catch (error) {
        setMensaje('Error de conexión al cargar.');
      }
    };
    
    cargarCliente();
  }, [id]);

  const actualizarCliente = async (e) => {
    e.preventDefault();
    setMensaje('Actualizando datos en el servidor...');

    try {
      const token = localStorage.getItem('token');
      const respuesta = await fetch(`http://localhost:5000/api/clientes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(cliente)
      });

      const data = await respuesta.json();

      if (respuesta.ok && data.status === 'success') {
        setMensaje('¡Jugador actualizado con éxito! Volviendo al panel...');
        setTimeout(() => navigate('/'), 1500); 
      } else {
        setMensaje('Error: ' + (data.message || 'No se pudo actualizar'));
      }
    } catch (error) {
      console.error('Error al actualizar:', error);
      setMensaje('Error de conexión con el backend.');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '2rem auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.8rem', color: '#2c3e50', margin: 0 }}>🛠️ Actualizar Ficha de Jugador</h2>
        <button onClick={() => navigate('/')} style={{ background: 'transparent', border: 'none', color: '#7f8c8d', cursor: 'pointer', fontWeight: 'bold' }}>
          ✕ Cancelar
        </button>
      </div>

      <form onSubmit={actualizarCliente} style={{ background: '#ffffff', padding: '2.5rem', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontWeight: 'bold', color: '#34495e', marginBottom: '0.5rem' }}>Nombre de la Empresa</label>
          <input 
            type="text" 
            required
            value={cliente.nombre}
            onChange={(e) => setCliente({...cliente, nombre: e.target.value})}
            style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '2px solid #ecf0f1', fontSize: '1rem', outline: 'none' }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontWeight: 'bold', color: '#34495e', marginBottom: '0.5rem' }}>Correo Electrónico</label>
          <input 
            type="email" 
            value={cliente.email}
            onChange={(e) => setCliente({...cliente, email: e.target.value})}
            style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '2px solid #ecf0f1', fontSize: '1rem', outline: 'none' }}
          />
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontWeight: 'bold', color: '#34495e', marginBottom: '0.5rem' }}>Teléfono</label>
          <input 
            type="text" 
            value={cliente.telefono}
            onChange={(e) => setCliente({...cliente, telefono: e.target.value})}
            style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '2px solid #ecf0f1', fontSize: '1rem', outline: 'none' }}
          />
        </div>

        <button type="submit" style={{ background: '#f39c12', color: '#fff', padding: '1.2rem', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem', width: '100%', boxShadow: '0 4px 15px rgba(243, 156, 18, 0.3)', marginBottom: '1rem' }}>
          Guardar Cambios 💾
        </button>

        {mensaje && (
          <div style={{ textAlign: 'center', fontWeight: 'bold', color: mensaje.includes('éxito') ? '#27ae60' : (mensaje.includes('Cargando') ? '#3498db' : '#e74c3c') }}>
            {mensaje}
          </div>
        )}
      </form>
    </div>
  );
}