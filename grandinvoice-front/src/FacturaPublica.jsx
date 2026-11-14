import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function FacturaPublica() {
  const { id } = useParams();
  const [factura, setFactura] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerFacturaPublica();
  }, [id]);

  const obtenerFacturaPublica = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/facturas/publica/${id}`);
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setFactura(data.data);
      }
    } catch (err) {
      console.error('Error cargando factura pública:', err);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'system-ui' }}>Cargando comprobante... ⏳</div>;
  }

  if (!factura) {
    return <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'system-ui' }}>El comprobante solicitado no existe o no está disponible.</div>;
  }

  const esPagada = (factura.estado || '').toLowerCase() === 'pagada';

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '1rem', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Botón de impresión rápida para el cliente */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button
          onClick={() => window.print()}
          style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          🖨️ Guardar en PDF / Imprimir
        </button>
      </div>

      {/* DOCUMENTO PÚBLICO */}
      <div style={{ background: '#fff', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
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
            <span style={{ display: 'inline-block', marginTop: '8px', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', backgroundColor: esPagada ? '#d1fae5' : '#ffedd5', color: esPagada ? '#047857' : '#c2410c' }}>
              {esPagada ? 'PAGADA' : 'PENDIENTE DE PAGO'}
            </span>
          </div>
        </div>

        <div style={{ backgroundColor: '#f8fafc', padding: '1.2rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#334155' }}>Cliente:</h4>
          <p style={{ margin: '0 0 0.2rem 0', fontWeight: 'bold', color: '#0f172a' }}>{factura.cliente_nombre}</p>
          {factura.cliente_email && <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>✉️ {factura.cliente_email}</p>}
        </div>

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
            {factura.detalles && factura.detalles.map((det) => (
              <tr key={det.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 10px', color: '#1e293b' }}>{det.descripcion}</td>
                <td style={{ padding: '12px 10px', textAlign: 'center', color: '#1e293b' }}>{det.cantidad}</td>
                <td style={{ padding: '12px 10px', textAlign: 'right', color: '#1e293b' }}>${Number(det.precio_unitario).toFixed(2)}</td>
                <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 'bold', color: '#0f172a' }}>${Number(det.subtotal).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '2px solid #e2e8f0', paddingTop: '1rem' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '1.1rem', color: '#475569', fontWeight: 'bold' }}>TOTAL: </span>
            <span style={{ fontSize: '1.8rem', color: '#0f172a', fontWeight: 'bold', marginLeft: '10px' }}>${Number(factura.monto).toFixed(2)}</span>
          </div>
        </div>
      </div>
      <style>{`@media print { .no-print { display: none !important; } }`}</style>
    </div>
  );
}