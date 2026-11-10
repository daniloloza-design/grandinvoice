import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NuevaFactura() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  
  // Estados para armar la factura
  const [clienteId, setClienteId] = useState('');
  const [numeroFactura, setNumeroFactura] = useState(`FAC-${Math.floor(Math.random() * 10000)}`);
  const [fechaEmision, setFechaEmision] = useState(new Date().toISOString().split('T')[0]);
  const [detalles, setDetalles] = useState([]);
  
  // Estado para el selector rápido de productos
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidad, setCantidad] = useState(1);

  useEffect(() => {
    cargarDatosPrevios();
  }, []);

  const cargarDatosPrevios = async () => {
    const token = localStorage.getItem('token');
    try {
      const [resClientes, resProductos] = await Promise.all([
        fetch('http://localhost:5000/api/clientes', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/productos', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      const dataClientes = await resClientes.json();
      const dataProductos = await resProductos.json();
      
      if (dataClientes.status === 'success') setClientes(dataClientes.data);
      if (dataProductos.status === 'success') setProductos(dataProductos.data);
    } catch (error) {
      console.error('Error cargando clientes/productos:', error);
    }
  };

  const agregarFila = () => {
    if (!productoSeleccionado) return;
    const prod = productos.find(p => p.id === parseInt(productoSeleccionado));
    if (!prod) return;

    const subtotal = prod.precio * cantidad;
    setDetalles([...detalles, { 
      producto_id: prod.id, 
      descripcion: prod.nombre, 
      cantidad: parseInt(cantidad), 
      precio_unitario: prod.precio, 
      subtotal 
    }]);
    
    // Limpiar selector
    setProductoSeleccionado('');
    setCantidad(1);
  };

  const eliminarFila = (index) => {
    const nuevosDetalles = [...detalles];
    nuevosDetalles.splice(index, 1);
    setDetalles(nuevosDetalles);
  };

  const totalFactura = detalles.reduce((acc, item) => acc + item.subtotal, 0);

  const guardarFacturaCompleta = async (e) => {
    e.preventDefault();
    if (!clienteId || detalles.length === 0) {
      return alert('Selecciona un cliente y agrega al menos un producto.');
    }

    const token = localStorage.getItem('token');
    try {
      // 1. Crear la cabecera de la factura
      const resFactura = await fetch('http://localhost:5000/api/facturas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          cliente_id: clienteId,
          numero_factura: numeroFactura,
          monto: totalFactura,
          fecha_emision: fechaEmision
        })
      });
      const dataFactura = await resFactura.json();

      if (resFactura.ok && dataFactura.status === 'success') {
        const facturaId = dataFactura.facturaId;

        // 2. Guardar cada fila de detalle
        for (let item of detalles) {
          await fetch(`http://localhost:5000/api/facturas/${facturaId}/detalles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(item)
          });
        }
        
        alert('¡Factura generada y guardada con éxito!');
        navigate('/'); // Volver al panel
      } else {
        alert('Error al crear factura: ' + dataFactura.message);
      }
    } catch (error) {
      console.error(error);
      alert('Hubo un error de conexión al guardar.');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: '#2c3e50', margin: '0 0 0.5rem 0' }}>Nueva Factura</h1>
          <p style={{ color: '#7f8c8d', margin: 0 }}>Generar cobro para un cliente</p>
        </div>
        <button onClick={() => navigate('/')} style={{ background: '#95a5a6', color: '#fff', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          ⬅ Cancelar
        </button>
      </div>

      <form onSubmit={guardarFacturaCompleta} style={{ background: '#fff', padding: '2rem', borderRadius: '16px', boxShadow: '0 8px 20px rgba(0,0,0,0.05)', border: '2px solid #ecf0f1' }}>
        
        {/* Cabecera */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#34495e' }}>Cliente</label>
            <select value={clienteId} onChange={(e) => setClienteId(e.target.value)} required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #bdc3c7' }}>
              <option value="">-- Seleccionar --</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#34495e' }}>No. Factura</label>
            <input type="text" value={numeroFactura} onChange={(e) => setNumeroFactura(e.target.value)} required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #bdc3c7' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#34495e' }}>Fecha</label>
            <input type="date" value={fechaEmision} onChange={(e) => setFechaEmision(e.target.value)} required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #bdc3c7' }} />
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '2px dashed #ecf0f1', margin: '2rem 0' }} />

        {/* Agregar Productos */}
        <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <div style={{ flex: 2 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#34495e' }}>Añadir Ítem del Catálogo</label>
            <select value={productoSeleccionado} onChange={(e) => setProductoSeleccionado(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #bdc3c7' }}>
              <option value="">-- Seleccionar producto/servicio --</option>
              {productos.map(p => <option key={p.id} value={p.id}>{p.nombre} - ${p.precio}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#34495e' }}>Cantidad</label>
            <input type="number" min="1" value={cantidad} onChange={(e) => setCantidad(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #bdc3c7', boxSizing: 'border-box' }} />
          </div>
          <button type="button" onClick={agregarFila} style={{ background: '#3498db', color: '#fff', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', height: '45px' }}>
            + Añadir
          </button>
        </div>

        {/* Tabla de Detalles */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
          <thead>
            <tr style={{ background: '#2c3e50', color: '#fff', textAlign: 'left' }}>
              <th style={{ padding: '1rem', borderRadius: '8px 0 0 8px' }}>Descripción</th>
              <th style={{ padding: '1rem' }}>Cant.</th>
              <th style={{ padding: '1rem' }}>Precio Unit.</th>
              <th style={{ padding: '1rem' }}>Subtotal</th>
              <th style={{ padding: '1rem', borderRadius: '0 8px 8px 0', textAlign: 'center' }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {detalles.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>Sin ítems en la factura</td></tr>
            ) : (
              detalles.map((item, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #ecf0f1' }}>
                  <td style={{ padding: '1rem' }}>{item.descripcion}</td>
                  <td style={{ padding: '1rem' }}>{item.cantidad}</td>
                  <td style={{ padding: '1rem' }}>${item.precio_unitario}</td>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>${item.subtotal.toFixed(2)}</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <button type="button" onClick={() => eliminarFila(index)} style={{ background: '#ff7675', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer' }}>X</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Total y Botón Final */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ecf0f1', padding: '1.5rem', borderRadius: '12px' }}>
          <h2 style={{ margin: 0, color: '#2c3e50' }}>Total a Cobrar:</h2>
          <h1 style={{ margin: 0, color: '#27ae60', fontSize: '2.5rem' }}>${totalFactura.toFixed(2)}</h1>
        </div>

        <button type="submit" style={{ width: '100%', background: '#27ae60', color: '#fff', border: 'none', padding: '1.2rem', borderRadius: '12px', fontSize: '1.2rem', fontWeight: 'bold', marginTop: '2rem', cursor: 'pointer', boxShadow: '0 8px 15px rgba(39, 174, 96, 0.3)' }}>
          💾 Guardar y Emitir Factura
        </button>

      </form>
    </div>
  );
}