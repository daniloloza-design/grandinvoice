import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Productos({ onLogout }) {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // Estados para el Modal y Formularios
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEnEdicion, setProductoEnEdicion] = useState(null);
  const [nuevoProducto, setNuevoProducto] = useState({ codigo: '', nombre: '', precio: '' });
  const [stock, setStock] = useState('');
  
  const navigate = useNavigate();

  const cargarProductos = async () => {
    try {
      const token = localStorage.getItem('token');
      const respuesta = await fetch('http://localhost:5000/api/productos', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await respuesta.json();
      if (respuesta.ok && data.status === 'success') {
        setProductos(data.data);
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const abrirModalNuevo = () => {
    setProductoEnEdicion(null);
    setNuevoProducto({ codigo: '', nombre: '', precio: '' });
    setStock('');
    setModalAbierto(true);
  };

  const abrirModalEditar = (producto) => {
    setProductoEnEdicion(producto.id);
    setNuevoProducto({ codigo: producto.codigo, nombre: producto.nombre, precio: producto.precio });
    setStock(producto.stock.toString());
    setModalAbierto(true);
  };

  const guardarProducto = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
        codigo: nuevoProducto.codigo,
        nombre: nuevoProducto.nombre,
        precio: parseFloat(nuevoProducto.precio),
        stock: parseInt(stock) || 0
      };

      // Si hay un ID en edición, usamos PUT, si no, usamos POST
      const url = productoEnEdicion 
        ? `http://localhost:5000/api/productos/${productoEnEdicion}` 
        : 'http://localhost:5000/api/productos';
        
      const metodo = productoEnEdicion ? 'PUT' : 'POST';

      const respuesta = await fetch(url, {
        method: metodo,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await respuesta.json();
      if (respuesta.ok && data.status === 'success') {
        setModalAbierto(false);
        cargarProductos();
      } else {
        alert('Error: ' + data.message);
      }
    } catch (err) {
      alert('Error de conexión al guardar.');
    }
  };

  const eliminarProducto = async (id, nombre) => {
    if (!window.confirm(`⚠️ ¿Eliminar permanentemente "${nombre}"?`)) return;
    try {
      const token = localStorage.getItem('token');
      const respuesta = await fetch(`http://localhost:5000/api/productos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (respuesta.ok) {
        setProductos(productos.filter(p => p.id !== id));
      }
    } catch (error) {
      alert('Error al eliminar.');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ color: '#2c3e50', margin: '0 0 0.5rem 0', fontSize: '2.2rem' }}>Catálogo</h1>
          <p style={{ margin: 0, color: '#7f8c8d', fontWeight: '500' }}>Productos y Servicios</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => navigate('/')} style={{ background: '#95a5a6', color: '#fff', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
            ⬅ Volver al Panel
          </button>
          <button onClick={abrirModalNuevo} style={{ background: '#27ae60', color: '#fff', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(39, 174, 96, 0.3)' }}>
            + Nuevo Ítem
          </button>
        </div>
      </div>

      {cargando ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#7f8c8d', fontWeight: 'bold' }}>Cargando catálogo... ⏳</div>
      ) : productos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#f8f9fa', borderRadius: '20px', border: '2px dashed #bdc3c7' }}>
          <h3 style={{ color: '#34495e', margin: '0 0 1rem 0' }}>Catálogo vacío</h3>
          <p style={{ color: '#7f8c8d', margin: 0 }}>Agrega tu primer producto o servicio para poder facturar.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {productos.map(producto => (
            <div key={producto.id} style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', border: '2px solid #ecf0f1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ background: '#3498db', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold' }}>{producto.codigo}</span>
                  <span style={{ background: '#f39c12', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold' }}>📦 Stock: {producto.stock || 0}</span>
                </div>
                <h3 style={{ color: '#2c3e50', marginTop: '0.8rem', marginBottom: '0.5rem' }}>{producto.nombre}</h3>
                <p style={{ color: '#27ae60', fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 1.5rem 0' }}>${producto.precio}</p>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                <button onClick={() => abrirModalEditar(producto)} style={{ flex: 1, background: '#fff', color: '#3498db', border: '2px solid #3498db', padding: '0.6rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Editar ✏️
                </button>
                <button onClick={() => eliminarProducto(producto.id, producto.nombre)} style={{ flex: 1, background: '#fff', color: '#e74c3c', border: '2px solid #e74c3c', padding: '0.6rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Eliminar 🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalAbierto && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '400px' }}>
            <h3 style={{ marginTop: 0, color: '#2c3e50', marginBottom: '1.5rem' }}>
              {productoEnEdicion ? 'Editar Producto' : 'Nuevo Producto / Servicio'}
            </h3>
            
            <form onSubmit={guardarProducto} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input type="text" placeholder="Código (ej. SRV-01)" value={nuevoProducto.codigo} onChange={(e) => setNuevoProducto({...nuevoProducto, codigo: e.target.value})} required style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #bdc3c7' }} />
              <input type="text" placeholder="Nombre del ítem" value={nuevoProducto.nombre} onChange={(e) => setNuevoProducto({...nuevoProducto, nombre: e.target.value})} required style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #bdc3c7' }} />
              <input type="number" step="0.01" placeholder="Precio ($)" value={nuevoProducto.precio} onChange={(e) => setNuevoProducto({...nuevoProducto, precio: e.target.value})} required style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #bdc3c7' }} />
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#34495e', fontSize: '0.9rem' }}>
                  📦 Unidades en Inventario
                </label>
                <input 
                  type="number" 
                  value={stock} 
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="Ej. 150"
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #bdc3c7', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                <button type="submit" style={{ flex: 1, background: '#27ae60', color: '#fff', padding: '0.8rem', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                  {productoEnEdicion ? 'Actualizar' : 'Guardar'}
                </button>
                <button type="button" onClick={() => setModalAbierto(false)} style={{ flex: 1, background: '#95a5a6', color: '#fff', padding: '0.8rem', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}