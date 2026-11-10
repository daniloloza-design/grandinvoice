import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NuevoCliente() {
  const navigate = useNavigate();
  const [cliente, setCliente] = useState({ nombre: '', email: '', telefono: '' });

  const guardarCliente = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const respuesta = await fetch('http://localhost:5000/api/clientes', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(cliente)
      });
      
      if (respuesta.ok) {
        navigate('/'); 
      } else {
        alert('Error al guardar el cliente');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '2rem auto', fontFamily: 'system-ui, sans-serif' }}>
      <h2 style={{ color: '#2c3e50', marginBottom: '1.5rem' }}>➕ Registrar Nuevo Cliente</h2>
      <div style={{ background: '#fff', padding: '2rem', borderRadius: '16px', boxShadow: '0 8px 20px rgba(0,0,0,0.06)', border: '2px solid #ecf0f1' }}>
        <form onSubmit={guardarCliente} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#34495e' }}>Nombre de la Empresa</label>
            <input required type="text" onChange={e => setCliente({...cliente, nombre: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '10px', border: '2px solid #ecf0f1', fontSize: '1rem' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#34495e' }}>Correo Electrónico</label>
            <input required type="email" onChange={e => setCliente({...cliente, email: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '10px', border: '2px solid #ecf0f1', fontSize: '1rem' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#34495e' }}>Teléfono</label>
            <input required type="text" onChange={e => setCliente({...cliente, telefono: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '10px', border: '2px solid #ecf0f1', fontSize: '1rem' }} />
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" style={{ flex: 1, background: '#3498db', color: '#fff', border: 'none', padding: '1rem', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Guardar Cliente</button>
            <button type="button" onClick={() => navigate('/')} style={{ flex: 1, background: '#ecf0f1', color: '#7f8c8d', border: 'none', padding: '1rem', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}