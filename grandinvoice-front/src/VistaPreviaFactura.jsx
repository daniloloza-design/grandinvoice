import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';

export default function VistaPreviaFactura() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [factura, setFactura] = useState(null);
  const [plantilla, setPlantilla] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Esta referencia apunta al "papel blanco" para decirle al motor PDF qué debe imprimir
  const componenteRef = useRef();

  // --- NUEVO MOTOR DE DESCARGA DIRECTA ---
  const descargarPDF = () => {
    const elemento = componenteRef.current;
    
    // Opciones para generar un PDF de alta calidad
    const opciones = {
      margin: [10, 10, 10, 10], // Márgenes superior, izquierdo, inferior, derecho
      filename: `Factura_${factura.numero_factura}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true }, // scale 2 duplica la nitidez del texto
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Esto toma el HTML y fuerza la descarga al disco duro
    html2pdf().set(opciones).from(elemento).save();
  };

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        // Traemos los datos crudos y el diseño al mismo tiempo
        const resFactura = await fetch(`http://localhost:5000/api/facturas/${id}`, { headers });
        const dataFactura = await resFactura.json();
        
        const resPlantilla = await fetch('http://localhost:5000/api/plantillas', { headers });
        const dataPlantilla = await resPlantilla.json();

        if (resFactura.ok && dataFactura.status === 'success') {
          setFactura(dataFactura.data);
        }
        
        if (resPlantilla.ok && dataPlantilla.status === 'success') {
          setPlantilla(dataPlantilla.data);
        } else {
          // Molde por defecto si no hay JSON
          setPlantilla([
            { id: '1', tipo: 'cabecera' },
            { id: '2', tipo: 'cliente' },
            { id: '3', tipo: 'tabla' },
            { id: '4', tipo: 'totales' }
          ]);
        }
      } catch (error) {
        console.error('Error al cargar la magia:', error);
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, [id]);

  if (cargando) return <h2 style={{textAlign: 'center', marginTop: '50px', color: '#2c3e50'}}>Ensamblando factura... ⏳</h2>;
  if (!factura) return <h2 style={{textAlign: 'center', color: '#e74c3c'}}>No se encontró la factura.</h2>;

  // --- EL MOTOR DE RENDERIZADO VISUAL ---
  const renderizarBloque = (bloque) => {
    switch (bloque.tipo) {
      case 'cabecera':
        return (
          <div key={bloque.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #ecf0f1', paddingBottom: '20px', marginBottom: '20px' }}>
            <div>
              <h1 style={{ color: '#2c3e50', margin: 0, fontSize: '2rem' }}>GRANDINVOICE</h1>
              <p style={{ color: '#7f8c8d', margin: 0 }}>Soluciones Profesionales</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h2 style={{ color: '#3498db', margin: 0, letterSpacing: '2px' }}>FACTURA</h2>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.1rem' }}>#{factura.numero_factura}</p>
              <p style={{ margin: 0, color: '#7f8c8d' }}>Fecha: {new Date(factura.fecha_emision).toLocaleDateString()}</p>
            </div>
          </div>
        );
      case 'cliente':
        return (
          <div key={bloque.id} style={{ marginBottom: '20px', padding: '20px', background: '#f8f9fa', borderRadius: '8px', borderLeft: '4px solid #3498db' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#34495e', textTransform: 'uppercase', fontSize: '0.85rem' }}>Facturar a:</h4>
            <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', fontSize: '1.2rem', color: '#2c3e50' }}>{factura.cliente_nombre}</p>
            <p style={{ margin: 0, color: '#7f8c8d' }}>📧 {factura.cliente_email}</p>
            <p style={{ margin: 0, color: '#7f8c8d' }}>📞 {factura.cliente_telefono}</p>
            <p style={{ margin: 0, color: '#7f8c8d' }}>📍 {factura.cliente_direccion}</p>
          </div>
        );
      case 'tabla':
        return (
          <table key={bloque.id} style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px', marginTop: '10px' }}>
            <thead>
              <tr style={{ background: '#2c3e50', color: '#fff' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderRadius: '6px 0 0 0' }}>Descripción del Servicio/Producto</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Cant.</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Precio Unit.</th>
                <th style={{ padding: '12px', textAlign: 'right', borderRadius: '0 6px 0 0' }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {factura.detalles && factura.detalles.length > 0 ? (
                factura.detalles.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #ecf0f1' }}>
                    <td style={{ padding: '15px 12px', color: '#34495e' }}>{item.descripcion}</td>
                    <td style={{ padding: '15px 12px', textAlign: 'center', color: '#7f8c8d' }}>{item.cantidad}</td>
                    <td style={{ padding: '15px 12px', textAlign: 'right', color: '#7f8c8d' }}>${item.precio_unitario}</td>
                    <td style={{ padding: '15px 12px', textAlign: 'right', fontWeight: 'bold', color: '#2c3e50' }}>${item.subtotal}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#bdc3c7' }}>No hay detalles registrados en esta factura.</td>
                </tr>
              )}
            </tbody>
          </table>
        );
      case 'totales':
        return (
          <div key={bloque.id} style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
            <div style={{ width: '300px', background: '#ebf5fb', padding: '20px', borderRadius: '8px', border: '1px solid #d6eaf8' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#34495e' }}>
                <span>Subtotal:</span>
                <span>${factura.monto}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.3rem', fontWeight: 'bold', color: '#2980b9', borderTop: '2px solid #bdc3c7', paddingTop: '15px', marginTop: '5px' }}>
                <span>TOTAL USD:</span>
                <span>${factura.monto}</span>
              </div>
            </div>
          </div>
        );
      case 'texto':
      case 'terminos':
        return (
          <div key={bloque.id} style={{ marginBottom: '20px', color: '#7f8c8d', fontSize: '0.9rem', padding: '15px', borderLeft: '3px solid #f39c12', background: '#fdfefe' }}>
            <strong style={{ color: '#d35400' }}>{bloque.titulo}:</strong> Gracias por su preferencia. El pago de esta factura debe realizarse en un plazo de 15 días hábiles a la cuenta indicada.
          </div>
        );
      case 'firma':
        return (
          <div key={bloque.id} style={{ marginTop: '60px', paddingBottom: '30px', textAlign: 'center', width: '250px', float: 'right' }}>
            <div style={{ borderTop: '2px solid #34495e', paddingTop: '10px' }}>
              <strong style={{ color: '#2c3e50' }}>{bloque.titulo}</strong>
              <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#7f8c8d' }}>Representante Autorizado</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: '2rem', backgroundColor: '#34495e', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* BARRA DE CONTROLES SUPERIOR */}
      <div style={{ width: '100%', maxWidth: '850px', display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <button onClick={() => navigate('/facturas/historial')} style={{ padding: '10px 20px', cursor: 'pointer', background: 'transparent', color: '#ecf0f1', border: '1px solid #ecf0f1', borderRadius: '5px', transition: '0.2s' }}>
          ⬅ Volver al Historial
        </button>
        <button onClick={descargarPDF} style={{ padding: '12px 25px', cursor: 'pointer', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 'bold', fontSize: '1rem', boxShadow: '0 4px 15px rgba(231,76,60,0.4)', transition: '0.2s' }}>
          📄 Descargar PDF Oficial
        </button>
      </div>

      {/* ESTE ES EL PAPEL BLANCO QUE SE IMPRIMIRÁ */}
      <div 
        ref={componenteRef} 
        style={{ width: '100%', maxWidth: '850px', background: '#fff', padding: '50px', boxShadow: '0 15px 35px rgba(0,0,0,0.2)', minHeight: '1100px', boxSizing: 'border-box', position: 'relative' }}
      >
        {/* Aquí iteramos sobre el JSON del usuario y dibujamos la factura */}
        {plantilla.map(bloque => renderizarBloque(bloque))}
        
        {/* Limpiador de floats para que la firma no rompa el diseño */}
        <div style={{ clear: 'both' }}></div>
      </div>

    </div>
  );
}