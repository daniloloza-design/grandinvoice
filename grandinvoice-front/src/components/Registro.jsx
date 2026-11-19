import React, { useState } from 'react';

const Registro = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    nombre_empresa: '',
    email: '',
    password: '',
    tipo_empresa: 'servicios'
  });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const tiposEmpresa = [
    {
      id: 'servicios',
      label: 'Servicios / Freelance',
      icon: '🛠️',
      desc: 'Cobros rápidos, honorarios y soporte técnico.'
    },
    {
      id: 'comercio',
      label: 'Comercio / Tienda',
      icon: '📦',
      desc: 'Inventario, stock automático y catálogo.'
    },
    {
      id: 'expres',
      label: 'Facturación Exprés',
      icon: '⚡',
      desc: 'Emisión e impresión al instante sin complicaciones.'
    }
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectTipo = (id) => {
    setFormData({ ...formData, tipo_empresa: id });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensaje || 'Error al crear la cuenta');
      }

      // Guardar token e ingresar al sistema
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      
      if (onLoginSuccess) {
        onLoginSuccess(data.usuario);
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Estilos dinámicos para animación de luces neón */}
      <style>{`
        @keyframes neonPulse {
          0%, 100% { box-shadow: 0 0 15px #00f0ff, 0 0 30px #00f0ff; }
          50% { box-shadow: 0 0 25px #ff007f, 0 0 50px #ff007f; }
        }
        @keyframes gridMove {
          0% { background-position: 0 0; }
          100% { background-position: 50px 50px; }
        }
        .btn-80s:hover {
          transform: translateY(-2px) scale(1.02);
          filter: brightness(1.2);
        }
        .card-tipo:hover {
          border-color: #00f0ff !important;
          background: rgba(0, 240, 255, 0.1) !important;
        }
      `}</style>

      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>GRANDINVOICE</h1>
          <p style={styles.subtitle}>CREA TU CUENTA Y ACTIVA TU ECOSISTEMA</p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Nombre de tu Empresa / Negocio</label>
            <input
              type="text"
              name="nombre_empresa"
              placeholder="Ej. Correa Trucking / Finktec"
              value={formData.nombre_empresa}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Correo Electrónico</label>
            <input
              type="email"
              name="email"
              placeholder="tu@empresa.com"
              value={formData.email}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Contraseña</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          {/* Selector interactivo de tipo de empresa */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Selecciona tu Perfil de Facturación</label>
            <div style={styles.gridTipos}>
              {tiposEmpresa.map((item) => {
                const activo = formData.tipo_empresa === item.id;
                return (
                  <div
                    key={item.id}
                    className="card-tipo"
                    onClick={() => handleSelectTipo(item.id)}
                    style={{
                      ...styles.tipoCard,
                      ...(activo ? styles.tipoCardActiva : {})
                    }}
                  >
                    <span style={styles.tipoIcon}>{item.icon}</span>
                    <strong style={styles.tipoLabel}>{item.label}</strong>
                    <p style={styles.tipoDesc}>{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="btn-80s"
            disabled={cargando}
            style={styles.button}
          >
            {cargando ? 'ACTIVANDO CAJA FUERTE...' : '¡DESPEGAR AHORA! 🚀'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Estilos Neón Synthwave 80s
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0915',
    backgroundImage: `
      linear-gradient(rgba(255, 0, 127, 0.08) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 240, 255, 0.08) 1px, transparent 1px)
    `,
    backgroundSize: '40px 40px',
    padding: '20px',
    fontFamily: "'Segoe UI', Roboto, sans-serif"
  },
  card: {
    width: '100%',
    maxWidth: '550px',
    backgroundColor: 'rgba(15, 14, 32, 0.85)',
    backdropFilter: 'blur(12px)',
    borderRadius: '16px',
    padding: '35px',
    border: '2px solid #ff007f',
    boxShadow: '0 0 20px rgba(255, 0, 127, 0.4), inset 0 0 15px rgba(0, 240, 255, 0.2)'
  },
  header: {
    textAlign: 'center',
    marginBottom: '25px'
  },
  title: {
    margin: 0,
    fontSize: '2.4rem',
    fontWeight: '900',
    letterSpacing: '3px',
    background: 'linear-gradient(180deg, #ffffff 0%, #00f0ff 50%, #ff007f 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: '0 0 10px rgba(0, 240, 255, 0.5)'
  },
  subtitle: {
    margin: '8px 0 0 0',
    fontSize: '0.85rem',
    color: '#00f0ff',
    letterSpacing: '2px',
    fontWeight: '600'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px'
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    color: '#ffffff',
    fontSize: '0.85rem',
    fontWeight: '700',
    letterSpacing: '1px',
    textTransform: 'uppercase'
  },
  input: {
    backgroundColor: 'rgba(5, 5, 15, 0.7)',
    border: '1px solid #00f0ff',
    borderRadius: '8px',
    padding: '12px 15px',
    color: '#ffffff',
    fontSize: '0.95rem',
    outline: 'none',
    boxShadow: 'inset 0 0 8px rgba(0, 240, 255, 0.2)'
  },
  gridTipos: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '10px',
    marginTop: '6px'
  },
  tipoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '10px',
    padding: '12px',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.2s ease-in-out'
  },
  tipoCardActiva: {
    borderColor: '#ff007f',
    backgroundColor: 'rgba(255, 0, 127, 0.15)',
    boxShadow: '0 0 12px rgba(255, 0, 127, 0.5)'
  },
  tipoIcon: {
    fontSize: '1.5rem',
    display: 'block',
    marginBottom: '4px'
  },
  tipoLabel: {
    color: '#ffffff',
    fontSize: '0.8rem',
    display: 'block'
  },
  tipoDesc: {
    color: '#a0a0c0',
    fontSize: '0.7rem',
    margin: '4px 0 0 0'
  },
  button: {
    marginTop: '10px',
    padding: '15px',
    background: 'linear-gradient(90deg, #ff007f 0%, #7928ca 50%, #00f0ff 100%)',
    border: 'none',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '1rem',
    fontWeight: '900',
    letterSpacing: '2px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 0 15px rgba(255, 0, 127, 0.5)'
  },
  errorBox: {
    backgroundColor: 'rgba(255, 0, 80, 0.2)',
    border: '1px solid #ff0050',
    color: '#ff80a0',
    padding: '10px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    textAlign: 'center',
    marginBottom: '15px'
  }
};

export default Registro;