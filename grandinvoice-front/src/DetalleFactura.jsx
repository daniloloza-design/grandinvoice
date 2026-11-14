import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function DetalleFactura() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [factura, setFactura] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerFactura();
  }, [id]);

  const obtenerFactura = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/facturas/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok && data.status === 'success') {
        setFactura(data.data);
      } else {
        alert(data.message || 'Error al obtener la factura');
      }
    } catch (err) {
      console.error('Error cargando factura:', err);
    } finally {
      setCargando(false);
    }
  };

  const alternarEstado = async () => {
    if (!factura) return;
    const esPagada = (factura.estado || '').toLowerCase() === 'pagada';
    const nuevoEstado = esPagada ? 'pendiente' : 'pagada';

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/facturas/${id}/estado`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setFactura({ ...factura, estado: nuevoEstado });
      } else {
        alert('Error al actualizar estado: ' + data.message);
      }
    } catch (err) {
      console.error('Error al cambiar estado:', err);
    }
  };

  if (cargando) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'system-ui' }}>
        <h3>Cargando comprobante... ⏳</h3>
      </div>
    );
  }

  if (!factura) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'system-ui' }}>
        <h3>Factura no encontrada</h3>
        <button onClick={() => navigate('/historial')} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          Volver al Historial
        </button>
      </div>
    );
  }

  const copiarEnlaceDigital = () => {
  const urlPublica = `${window.location.origin}/ver-factura/${id}`;
  navigator.clipboard.writeText(urlPublica);
  alert('¡Enlace digital copiado al portapapeles!');
};

const enviarWhatsApp = () => {
  const urlPublica = `${window.location.origin}/ver-factura/${id}`;
  const mensaje = encodeURIComponent(`Hola ${factura.cliente_nombre}, adjunto el enlace de su factura N° ${factura.numero_factura}: ${urlPublica}`);
  window.open(`https://wa.me/${factura.cliente_telefono || ''}?text=${mensaje}`, '_blank');
};

  const esPagada = (factura.estado || '').toLowerCase() === 'pagada';

  return (
    <div style={{ maxWidth: '850px', margin: '2rem auto', padding: '1rem', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Botones de control (Se ocultan automáticamente al imprimir en papel) */}
<div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.8rem' }}>
  <button
    onClick={() => navigate(-1)}
    style={{ background: '#64748b', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
  >
    ⬅️ Volver
  </button>

  <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
    {/* OPCIÓN 1: CAMBIAR ESTADO (PAGADA / PENDIENTE) */}
    <button
      onClick={alternarEstado}
      style={{
        background: esPagada ? '#e11d48' : '#10b981',
        color: '#fff',
        border: 'none',
        padding: '0.6rem 1.2rem',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold'
      }}
    >
      {esPagada ? 'Marcar como Pendiente ↩️' : 'Marcar como Pagada / Cobrada 💵'}
    </button>

    {/* OPCIÓN 2: IMPRESIÓN RÁPIDA DE IMPRESORA / NAVEGADOR */}
    <button
      onClick={() => window.print()}
      style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
    >
      🖨️ Imprimir Directo
    </button>

    {/* OPCIÓN 3: GENERAR Y DESCARGAR ARCHIVO PDF */}
    <button
      onClick={() => navigate(`/facturas/${id}/imprimir`)}
      style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
    >
      📄 Ver / Descargar PDF
    </button>

    <button
  onClick={copiarEnlaceDigital}
  style={{ background: '#8b5cf6', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
>
  🔗 Copiar Enlace Digital
</button>

<button
  onClick={enviarWhatsApp}
  style={{ background: '#25d366', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
>
  💬 WhatsApp
</button>

  </div>
</div>

      {/* DOCUMENTO DE FACTURA */}
      <div style={{ background: '#fff', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
        
        {/* Cabecera */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #f1f5f9', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ margin: 0, color: '#0f172a', fontSize: '1.8rem' }}>GrandInvoice</h1>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>Comprobante de Venta</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ margin: 0, color: '#2563eb' }}>{factura.numero_factura}</h2>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
              Fecha: {new Date(factura.fecha_emision || factura.fecha_creacion).toLocaleDateString()}
            </p>
            <span
              style={{
                display: 'inline-block',
                marginTop: '8px',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                backgroundColor: esPagada ? '#d1fae5' : '#ffedd5',
                color: esPagada ? '#047857' : '#c2410c'
              }}
            >
              {esPagada ? 'PAGADA' : 'PENDIENTE'}
            </span>
          </div>
        </div>

        {/* Datos del Cliente */}
        <div style={{ backgroundColor: '#f8fafc', padding: '1.2rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#334155' }}>Facturado a:</h4>
          <p style={{ margin: '0 0 0.2rem 0', fontWeight: 'bold', color: '#0f172a' }}>{factura.cliente_nombre}</p>
          {factura.cliente_email && <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>✉️ {factura.cliente_email}</p>}
          {factura.cliente_telefono && <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>📞 {factura.cliente_telefono}</p>}
          {factura.cliente_direccion && <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>📍 {factura.cliente_direccion}</p>}
        </div>

        {/* Tabla de Items */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9', textTransform: 'uppercase', fontSize: '0.8rem', color: '#475569', textAlign: 'left' }}>
              <th style={{ padding: '10px' }}>Descripción</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>Cant.</th>
              <th style={{ padding: '10px', textAlign: 'right' }}>P. Unitario</th>
              <th style={{ padding: '10px', textAlign: 'right' }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {factura.detalles && factura.detalles.length > 0 ? (
              factura.detalles.map((det) => (
                <tr key={det.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 10px', color: '#1e293b' }}>{det.descripcion}</td>
                  <td style={{ padding: '12px 10px', textAlign: 'center', color: '#1e293b' }}>{det.cantidad}</td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', color: '#1e293b' }}>${Number(det.precio_unitario).toFixed(2)}</td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 'bold', color: '#0f172a' }}>${Number(det.subtotal).toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ padding: '15px', textAlign: 'center', color: '#94a3b8' }}>
                  Sin ítems registrados en esta factura.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Total General */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '2px solid #e2e8f0', paddingTop: '1rem' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '1.1rem', color: '#475569', fontWeight: 'bold' }}>TOTAL: </span>
            <span style={{ fontSize: '1.8rem', color: '#0f172a', fontWeight: 'bold', marginLeft: '10px' }}>
              ${Number(factura.monto).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Regla CSS para ocultar botones al imprimir */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
        }
      `}</style>
    </div>
  );
}