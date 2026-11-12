import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DndContext, 
  closestCenter, 
  PointerSensor, 
  useSensor, 
  useSensors 
} from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
const ECOSISTEMAS = {
  transporte: [
    { id: 'eco-t-1', tipo: 'cabecera', titulo: '🚚 Logo y Datos de la Flota' },
    { id: 'eco-t-2', tipo: 'cliente', titulo: '🏢 Datos del Remitente / Consignatario' },
    { id: 'eco-t-3', tipo: 'texto', titulo: '📍 Ruta y Detalles del Viaje (Origen - Destino)' },
    { id: 'eco-t-4', tipo: 'tabla', titulo: '📦 Detalle de Carga y Fletes' },
    { id: 'eco-t-5', tipo: 'totales', titulo: '💰 Subtotal y Total' },
    { id: 'eco-t-6', tipo: 'terminos', titulo: '⚠️ Condiciones de Carga y Seguro' }
  ],
  medico: [
    { id: 'eco-m-1', tipo: 'cabecera', titulo: '⚕️ Clínica / Doctor (Cabecera)' },
    { id: 'eco-m-2', tipo: 'cliente', titulo: '👤 Datos del Paciente' },
    { id: 'eco-m-3', tipo: 'tabla', titulo: '🩺 Procedimientos y Consultas' },
    { id: 'eco-m-4', tipo: 'totales', titulo: '💰 Total a Pagar' },
    { id: 'eco-m-5', tipo: 'firma', titulo: '✍️ Firma y Sello Médico' }
  ],
  agencia: [
    { id: 'eco-a-1', tipo: 'cabecera', titulo: '🎨 Logo de la Agencia' },
    { id: 'eco-a-2', tipo: 'cliente', titulo: '💼 Datos del Cliente / Marca' },
    { id: 'eco-a-3', tipo: 'texto', titulo: '🎯 Objetivo de la Campaña / Hitos' },
    { id: 'eco-a-4', tipo: 'tabla', titulo: '📈 Servicios y Entregables' },
    { id: 'eco-a-5', tipo: 'totales', titulo: '💰 Inversión Total' },
    { id: 'eco-a-6', tipo: 'terminos', titulo: '⚠️ Términos de Propiedad Intelectual' }
  ],
  tienda: [
    { id: 'eco-s-1', tipo: 'cabecera', titulo: '🏪 Logo del Local' },
    { id: 'eco-s-2', tipo: 'cliente', titulo: '👤 Cliente' },
    { id: 'eco-s-3', tipo: 'tabla', titulo: '🛍️ Lista de Artículos' },
    { id: 'eco-s-4', tipo: 'totales', titulo: '💰 Total' },
    { id: 'eco-s-5', tipo: 'terminos', titulo: '⚠️ Política de Devoluciones (30 días)' }
  ]
};

function BloqueSortable({ id, titulo, alSeleccionar, estaActivo }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    border: estaActivo ? '2px solid #3498db' : '2px dashed #bdc3c7', 
    padding: '1.5rem', 
    marginBottom: '1rem', 
    borderRadius: '8px', 
    background: estaActivo ? '#ebf5fb' : '#f8f9fa', 
    textAlign: 'center', 
    color: estaActivo ? '#2980b9' : '#34495e', 
    fontWeight: 'bold',
    cursor: 'grab', 
    touchAction: 'none',
    boxShadow: transform ? '0 10px 20px rgba(0,0,0,0.1)' : 'none',
    zIndex: transform ? 999 : 1
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={() => alSeleccionar(id)}>
      {titulo}
    </div>
  );
}

export default function ConstructorVisual() {
  const navigate = useNavigate();

  const [elementosLienzo, setElementosLienzo] = useState([
    { id: 'mod-1', tipo: 'cabecera', titulo: '🖼️ Logo y Cabecera' },
    { id: 'mod-2', tipo: 'cliente', titulo: '👤 Datos del Cliente' },
    { id: 'mod-3', tipo: 'tabla', titulo: '📋 Tabla de Artículos' },
    { id: 'mod-4', tipo: 'totales', titulo: '💰 Subtotal y Total' }
  ]);
  
  const [mostrarModalEcosistemas, setMostrarModalEcosistemas] = useState(false);

  const cargarEcosistema = (claveIndustria) => {
    // Reemplaza todo el lienzo con la configuración prefabricada
    setElementosLienzo(ECOSISTEMAS[claveIndustria]);
    setMostrarModalEcosistemas(false);
  };
  const [idActivo, setIdActivo] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const sensores = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const manejarFinArrastre = (evento) => {
    const { active, over } = evento;
    if (active.id !== over?.id) {
      setElementosLienzo((items) => {
        const indiceViejo = items.findIndex(item => item.id === active.id);
        const indiceNuevo = items.findIndex(item => item.id === over.id);
        return arrayMove(items, indiceViejo, indiceNuevo);
      });
    }
  };

  const agregarBloque = (tipo, tituloBase) => {
    const nuevoId = `mod-${Date.now()}`;
    setElementosLienzo([...elementosLienzo, { id: nuevoId, tipo, titulo: tituloBase }]);
  };

  const actualizarTitulo = (nuevoTitulo) => {
    setElementosLienzo(items => items.map(item => item.id === idActivo ? { ...item, titulo: nuevoTitulo } : item));
  };

  const eliminarActivo = () => {
    setElementosLienzo(items => items.filter(item => item.id !== idActivo));
    setIdActivo(null);
  };

  // --- NUEVA FUNCIÓN PARA CARGAR AL INICIO ---
  useEffect(() => {
    const cargarPlantilla = async () => {
      try {
        const token = localStorage.getItem('token');
        const respuesta = await fetch('http://localhost:5000/api/plantillas', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await respuesta.json();
        
        // Si el servidor nos devuelve un diseño guardado, reemplazamos el predeterminado
        if (respuesta.ok && data.status === 'success') {
          setElementosLienzo(data.data);
        }
      } catch (error) {
        console.error('Error al intentar cargar la plantilla:', error);
      }
    };

    cargarPlantilla();
  }, []); // Los corchetes vacíos aseguran que esto solo se ejecute al abrir la pantalla

  // --- NUEVA FUNCIÓN PARA ENVIAR EL JSON AL BACKEND ---
  const guardarPlantilla = async () => {
    setGuardando(true);
    try {
      const token = localStorage.getItem('token');
      const respuesta = await fetch('http://localhost:5000/api/plantillas', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ configuracion: elementosLienzo }) // Enviamos el estado directo
      });
      
      const data = await respuesta.json();
      if (respuesta.ok && data.status === 'success') {
        alert('¡Plantilla guardada con éxito en la nube! 💾');
      } else {
        alert('Error al guardar: ' + data.message);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      alert('Problema al conectar con el servidor.');
    } finally {
      setGuardando(false);
    }
  };

  const bloqueSeleccionado = elementosLienzo.find(item => item.id === idActivo);

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'system-ui, sans-serif', backgroundColor: '#ecf0f1' }}>
      
      <div style={{ width: '250px', background: '#2c3e50', color: '#fff', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
        <button onClick={() => navigate('/')} style={{ background: 'transparent', color: '#bdc3c7', border: '1px solid #7f8c8d', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', marginBottom: '2rem' }}>
          ⬅ Volver al Panel
        </button>
        
        {/* EL BOTÓN DE GUARDAR */}
        <button 
          onClick={guardarPlantilla} 
          disabled={guardando}
          style={{ background: '#27ae60', color: '#fff', border: 'none', padding: '1rem', borderRadius: '8px', fontWeight: 'bold', cursor: guardando ? 'wait' : 'pointer', marginBottom: '2rem', boxShadow: '0 4px 10px rgba(39, 174, 96, 0.3)' }}
        >
          {guardando ? 'Guardando... ⏳' : '💾 Guardar Plantilla'}
        </button>

        {/* BOTÓN DE ECOSISTEMAS PREDISEÑADOS */}
        <button 
          onClick={() => setMostrarModalEcosistemas(!mostrarModalEcosistemas)}
          style={{ background: '#f39c12', color: '#fff', border: 'none', padding: '1rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '2rem', boxShadow: '0 4px 10px rgba(243, 156, 18, 0.3)' }}
        >
          🚀 Cargar Ecosistemas
        </button>

        {/* SUBMENÚ DESPLEGABLE DE INDUSTRIAS */}
        {mostrarModalEcosistemas && (
          <div style={{ background: '#1abc9c', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#fff', fontSize: '0.9rem' }}>Elige tu Industria:</h4>
            
            <div onClick={() => cargarEcosistema('transporte')} style={{ fontSize: '0.85rem', padding: '8px', background: 'rgba(0,0,0,0.1)', marginBottom: '5px', borderRadius: '4px', cursor: 'pointer' }}>🚛 Logística y Transporte</div>
            <div onClick={() => cargarEcosistema('medico')} style={{ fontSize: '0.85rem', padding: '8px', background: 'rgba(0,0,0,0.1)', marginBottom: '5px', borderRadius: '4px', cursor: 'pointer' }}>🩺 Sector Médico</div>
            <div onClick={() => cargarEcosistema('agencia')} style={{ fontSize: '0.85rem', padding: '8px', background: 'rgba(0,0,0,0.1)', marginBottom: '5px', borderRadius: '4px', cursor: 'pointer' }}>🎨 Agencia Creativa</div>
            <div onClick={() => cargarEcosistema('tienda')} style={{ fontSize: '0.85rem', padding: '8px', background: 'rgba(0,0,0,0.1)', marginBottom: '5px', borderRadius: '4px', cursor: 'pointer' }}>🏪 Tienda Retail</div>
            
            <div onClick={() => { setElementosLienzo([]); setMostrarModalEcosistemas(false); }} style={{ fontSize: '0.85rem', padding: '8px', background: '#e74c3c', marginTop: '15px', borderRadius: '4px', cursor: 'pointer', textAlign: 'center', fontWeight: 'bold' }}>✨ Lienzo en Blanco (DIY)</div>
          </div>
        )}

        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>Herramientas</h3>
        
        <div onClick={() => agregarBloque('texto', '📝 Nuevo Texto')} style={{ background: '#34495e', padding: '1rem', borderRadius: '8px', marginBottom: '0.5rem', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.target.style.background='#3b536b'} onMouseLeave={e => e.target.style.background='#34495e'}>+ Bloque de Texto</div>
        <div onClick={() => agregarBloque('terminos', '⚠️ Términos y Notas')} style={{ background: '#34495e', padding: '1rem', borderRadius: '8px', marginBottom: '0.5rem', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.target.style.background='#3b536b'} onMouseLeave={e => e.target.style.background='#34495e'}>+ Términos y Notas</div>
        <div onClick={() => agregarBloque('firma', '✍️ Firma Digital')} style={{ background: '#34495e', padding: '1rem', borderRadius: '8px', marginBottom: '0.5rem', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.target.style.background='#3b536b'} onMouseLeave={e => e.target.style.background='#34495e'}>+ Firma Digital</div>
      </div>

      <div style={{ flex: 1, padding: '2rem', display: 'flex', justifyContent: 'center', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: '800px', background: '#fff', padding: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', borderRadius: '4px', minHeight: '1000px' }}>
          <h2 style={{ color: '#bdc3c7', textAlign: 'center', marginBottom: '2rem', fontWeight: '400' }}>Área de Diseño A4</h2>
          
          <DndContext sensors={sensores} collisionDetection={closestCenter} onDragEnd={manejarFinArrastre}>
            <SortableContext items={elementosLienzo} strategy={verticalListSortingStrategy}>
              {elementosLienzo.map((bloque) => (
                <BloqueSortable 
                  key={bloque.id} 
                  id={bloque.id} 
                  titulo={bloque.titulo} 
                  alSeleccionar={setIdActivo}
                  estaActivo={idActivo === bloque.id}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>

      <div style={{ width: '300px', background: '#fff', borderLeft: '1px solid #bdc3c7', padding: '1.5rem' }}>
        <h3 style={{ color: '#2c3e50', margin: '0 0 1.5rem 0' }}>Propiedades</h3>
        
        {bloqueSeleccionado ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: '#ebf5fb', padding: '0.8rem', borderRadius: '6px', color: '#2980b9', fontSize: '0.9rem', fontWeight: 'bold' }}>
              Editando: {bloqueSeleccionado.tipo}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#34495e', fontSize: '0.9rem' }}>Texto del bloque</label>
              <input 
                type="text" 
                value={bloqueSeleccionado.titulo} 
                onChange={(e) => actualizarTitulo(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #bdc3c7', boxSizing: 'border-box' }}
              />
            </div>

            <button 
              onClick={eliminarActivo}
              style={{ marginTop: '1rem', background: '#e74c3c', color: '#fff', border: 'none', padding: '0.8rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              🗑️ Eliminar Bloque
            </button>
          </div>
        ) : (
          <p style={{ color: '#7f8c8d', fontSize: '0.95rem', background: '#f8f9fa', padding: '1rem', borderRadius: '8px', border: '1px dashed #bdc3c7' }}>
            👆 Haz clic en un bloque del lienzo para editar sus propiedades.
          </p>
        )}
      </div>

    </div>
  );
}