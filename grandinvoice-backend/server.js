const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: __dirname + '/.env' }); 

const app = express();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

app.use(cors());
app.use(express.json());

// --- PUENTE A BANAHOSTING ---
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

console.log('Motor MySQL de Banahosting listo y a la espera.');

// Ruta de prueba
app.get('/api/status', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS solution');
        res.json({ 
            status: 'success', 
            message: '¡Conexión a Banahosting exitosa leyendo el .env!',
            db_test: rows[0].solution 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Error conectando a Banahosting' });
    }
});

// --- MIDDLEWARE: Candado de Seguridad (Verificar JWT) ---
const verificarToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ status: 'error', message: 'Acceso denegado. Se requiere un token.' });
    }

    try {
        const token = authHeader.replace('Bearer ', '');
        const verificado = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = verificado; 
        next(); 
    } catch (error) {
        res.status(401).json({ status: 'error', message: 'Token inválido o expirado.' });
    }
};

// ==========================================
// RUTA DE REGISTRO MULTIUSUARIO (NUEVA)
// ==========================================
app.post('/api/auth/registro', async (req, res) => {
  const { nombre_empresa, email, password, tipo_empresa } = req.body;

  if (!nombre_empresa || !email || !password) {
    return res.status(400).json({ mensaje: 'Todos los campos obligatorios deben ser completados.' });
  }

  try {
    // 1. Verificar si el correo ya existe
    const [existente] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existente.length > 0) {
      return res.status(400).json({ mensaje: 'El correo electrónico ya está registrado.' });
    }

    // 2. Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Insertar nuevo usuario en la base de datos de Banahosting
    const [resultado] = await pool.query(
      'INSERT INTO usuarios (nombre_empresa, email, password, tipo_empresa) VALUES (?, ?, ?, ?)',
      [nombre_empresa, email, hashedPassword, tipo_empresa || 'general']
    );

    const nuevoUsuarioId = resultado.insertId;

    // 4. Generar Token JWT automático
    const token = jwt.sign(
      { id: nuevoUsuarioId, email, nombre_empresa },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(201).json({
      mensaje: 'Registro exitoso',
      token,
      usuario: { id: nuevoUsuarioId, nombre_empresa, email, tipo_empresa }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor al registrar usuario.' });
  }
});

// ==========================================
// RUTAS DE PLANTILLAS VISUALES
// ==========================================
app.post('/api/plantillas', verificarToken, async (req, res) => {
  const { configuracion } = req.body;
  const usuario_id = req.usuario.id;

  try {
    const query = `
      INSERT INTO plantillas (usuario_id, configuracion) 
      VALUES (?, ?) 
      ON DUPLICATE KEY UPDATE configuracion = ?
    `;
    
    const configTexto = JSON.stringify(configuracion);
    await pool.query(query, [usuario_id, configTexto, configTexto]);
    
    res.json({ status: 'success', message: 'Plantilla guardada correctamente' });
  } catch (error) {
    console.error('Error al guardar plantilla:', error);
    res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
  }
});

app.get('/api/plantillas', verificarToken, async (req, res) => {
  const usuario_id = req.usuario.id; 
  try {
    const [rows] = await pool.query('SELECT configuracion FROM plantillas WHERE usuario_id = ?', [usuario_id]);
    
    if (rows.length > 0) {
      res.json({ status: 'success', data: JSON.parse(rows[0].configuracion) });
    } else {
      res.json({ status: 'empty' });
    }
  } catch (error) {
    console.error('Error al cargar plantilla:', error);
    res.status(500).json({ status: 'error', message: 'Error al cargar diseño' });
  }
});

// --- RUTA PROTEGIDA ---
app.get('/api/sistema/privado', verificarToken, (req, res) => {
    res.json({
        status: 'success',
        message: '¡Bienvenido a la zona VIP de GrandInvoice!',
        usuarioAutorizado: req.usuario
    });
});

// --- RUTA: Iniciar Sesión (Login) ---
app.post('/api/usuarios/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const [usuarios] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (usuarios.length === 0) {
            return res.status(401).json({ status: 'error', message: 'Credenciales inválidas' });
        }

        const usuario = usuarios[0];

        const passwordValido = await bcrypt.compare(password, usuario.password);
        if (!passwordValido) {
            return res.status(401).json({ status: 'error', message: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { id: usuario.id, email: usuario.email, nombre_empresa: usuario.nombre_empresa },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            status: 'success',
            message: '¡Inicio de sesión exitoso!',
            token,
            usuario: { id: usuario.id, nombre_empresa: usuario.nombre_empresa, email: usuario.email, tipo_empresa: usuario.tipo_empresa }
        });

    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor al iniciar sesión' });
    }
});

// --- RUTA: Crear Cliente ---
app.post('/api/clientes', verificarToken, async (req, res) => {
    try {
        const { nombre, email, telefono, direccion } = req.body;
        const usuario_id = req.usuario.id; 

        const [resultado] = await pool.query(
            'INSERT INTO clientes (usuario_id, nombre, email, telefono, direccion) VALUES (?, ?, ?, ?, ?)',
            [usuario_id, nombre, email, telefono, direccion]
        );

        res.status(201).json({
            status: 'success',
            message: '¡Cliente registrado exitosamente en GrandInvoice!',
            clienteId: resultado.insertId
        });

    } catch (error) {
        console.error('Error al registrar cliente:', error);
        res.status(500).json({ status: 'error', message: 'Error interno al guardar el cliente' });
    }
});

// --- RUTA: Obtener Clientes ---
app.get('/api/clientes', verificarToken, async (req, res) => {
    try {
        const usuario_id = req.usuario.id; 

        const [clientes] = await pool.query(
            'SELECT * FROM clientes WHERE usuario_id = ? ORDER BY fecha_registro DESC',
            [usuario_id]
        );

        res.json({
            status: 'success',
            cantidad: clientes.length,
            data: clientes
        });

    } catch (error) {
        console.error('Error al obtener clientes:', error);
        res.status(500).json({ status: 'error', message: 'Error interno al cargar los clientes' });
    }
});

// --- RUTA: Actualizar Cliente ---
app.put('/api/clientes/:id', verificarToken, async (req, res) => { 
    try {
        const { id } = req.params;
        const { nombre, email, telefono } = req.body;
        const usuario_id = req.usuario.id; 

        const [resultado] = await pool.query(
            'UPDATE clientes SET nombre = ?, email = ?, telefono = ? WHERE id = ? AND usuario_id = ?',
            [nombre, email, telefono, id, usuario_id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ status: 'error', message: 'Cliente no encontrado o acceso denegado' });
        }

        res.json({ status: 'success', message: 'Datos del cliente actualizados' });
    } catch (error) {
        console.error('Error al actualizar cliente:', error);
        res.status(500).json({ status: 'error', message: 'Error en la base de datos al actualizar' });
    }
});

// --- RUTA: Eliminar Cliente ---
app.delete('/api/clientes/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const usuario_id = req.usuario.id; 

        const [resultado] = await pool.query(
            'DELETE FROM clientes WHERE id = ? AND usuario_id = ?',
            [id, usuario_id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ status: 'error', message: 'Cliente no encontrado o acceso denegado' });
        }

        res.json({ status: 'success', message: 'Cliente eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar cliente:', error);
        res.status(500).json({ status: 'error', message: 'Error en la base de datos al eliminar' });
    }
});

// --- RUTA: Crear Factura ---
app.post('/api/facturas', verificarToken, async (req, res) => {
    try {
        const { cliente_id, numero_factura, monto, fecha_emision } = req.body;
        const usuario_id = req.usuario.id; 

        const [resultado] = await pool.query(
            'INSERT INTO facturas (usuario_id, cliente_id, numero_factura, monto, fecha_emision) VALUES (?, ?, ?, ?, ?)',
            [usuario_id, cliente_id, numero_factura, monto, fecha_emision]
        );

        res.status(201).json({
            status: 'success',
            message: '¡Factura creada exitosamente en GrandInvoice!',
            facturaId: resultado.insertId
        });

    } catch (error) {
        console.error('Error al crear factura:', error);
        res.status(500).json({ status: 'error', message: 'Error interno al guardar la factura' });
    }
});

// --- RUTA: Obtener Facturas ---
app.get('/api/facturas', verificarToken, async (req, res) => {
    try {
        const usuario_id = req.usuario.id; 

        const [facturas] = await pool.query(
            `SELECT f.*, c.nombre AS cliente_nombre 
             FROM facturas f 
             JOIN clientes c ON f.cliente_id = c.id 
             WHERE f.usuario_id = ? 
             ORDER BY f.fecha_creacion DESC`,
            [usuario_id]
        );

        res.json({
            status: 'success',
            cantidad: facturas.length,
            data: facturas
        });

    } catch (error) {
        console.error('Error al obtener facturas:', error);
        res.status(500).json({ status: 'error', message: 'Error interno al cargar las facturas' });
    }
});

// --- RUTA: Actualizar Estado Factura ---
app.put('/api/facturas/:id/estado', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body; 
        const usuario_id = req.usuario.id; 

        const [resultado] = await pool.query(
            'UPDATE facturas SET estado = ? WHERE id = ? AND usuario_id = ?',
            [estado, id, usuario_id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ status: 'error', message: 'Factura no encontrada o acceso denegado' });
        }

        res.json({
            status: 'success',
            message: `¡Factura #${id} actualizada exitosamente al estado: ${estado}!`
        });

    } catch (error) {
        console.error('Error al actualizar factura:', error);
        res.status(500).json({ status: 'error', message: 'Error interno al actualizar la factura' });
    }
});

// --- RUTA: Agregar Detalle a Factura ---
app.post('/api/facturas/:id/detalles', verificarToken, async (req, res) => {
    try {
        const factura_id = req.params.id; 
        const { descripcion, cantidad, precio_unitario } = req.body;
        const usuario_id = req.usuario.id;

        const [verificacion] = await pool.query(
            'SELECT id FROM facturas WHERE id = ? AND usuario_id = ?',
            [factura_id, usuario_id]
        );

        if (verificacion.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Factura no encontrada o acceso denegado' });
        }

        const subtotal = cantidad * precio_unitario;

        const [resultado] = await pool.query(
            'INSERT INTO detalles_factura (factura_id, descripcion, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)',
            [factura_id, descripcion, cantidad, precio_unitario, subtotal]
        );

        res.status(201).json({
            status: 'success',
            message: '¡Servicio agregado a la factura exitosamente!',
            detalleId: resultado.insertId,
            subtotal: subtotal
        });

    } catch (error) {
        console.error('Error al agregar detalle:', error);
        res.status(500).json({ status: 'error', message: 'Error interno al guardar el detalle' });
    }
});

// --- RUTA: Obtener Factura Individual ---
app.get('/api/facturas/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const usuario_id = req.usuario.id;

        const [facturaResult] = await pool.query(
            `SELECT f.*, c.nombre AS cliente_nombre, c.email AS cliente_email, c.telefono AS cliente_telefono, c.direccion AS cliente_direccion
             FROM facturas f
             JOIN clientes c ON f.cliente_id = c.id
             WHERE f.id = ? AND f.usuario_id = ?`,
            [id, usuario_id]
        );

        if (facturaResult.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Factura no encontrada o acceso denegado' });
        }

        const [detalles] = await pool.query(
            'SELECT id, descripcion, cantidad, precio_unitario, subtotal FROM detalles_factura WHERE factura_id = ?',
            [id]
        );

        res.json({
            status: 'success',
            data: {
                ...facturaResult[0],
                detalles
            }
        });

    } catch (error) {
        console.error('Error al obtener la factura completa:', error);
        res.status(500).json({ status: 'error', message: 'Error interno al cargar la factura' });
    }
});

// --- MÓDULO DE PRODUCTOS ---
app.get('/api/productos', verificarToken, async (req, res) => {
  const usuario_id = req.usuario.id;
  try {
    const [rows] = await pool.query('SELECT id, codigo, nombre, precio, stock FROM productos WHERE usuario_id = ?', [usuario_id]);
    res.json({ status: 'success', data: rows });
  } catch (error) {
    console.error('Error GET productos:', error);
    res.status(500).json({ status: 'error', message: 'Error al obtener productos' });
  }
});

app.put('/api/productos/:id', verificarToken, async (req, res) => {
  const { codigo, nombre, precio, stock } = req.body;
  const { id } = req.params;
  const usuario_id = req.usuario.id;
  
  try {
    await pool.query(
      'UPDATE productos SET codigo = ?, nombre = ?, precio = ?, stock = ? WHERE id = ? AND usuario_id = ?',
      [codigo, nombre, precio, stock || 0, id, usuario_id]
    );
    res.json({ status: 'success', message: 'Producto actualizado' });
  } catch (err) {
    console.error('Error PUT productos:', err);
    res.status(500).json({ status: 'error', message: 'Error al actualizar el producto' });
  }
});

app.post('/api/productos', verificarToken, async (req, res) => {
    const { codigo, nombre, precio } = req.body;
    const usuario_id = req.usuario.id;
    try {
        const [result] = await pool.query(
            'INSERT INTO productos (usuario_id, codigo, nombre, precio) VALUES (?, ?, ?, ?)',
            [usuario_id, codigo, nombre, precio]
        );
        res.status(201).json({ status: 'success', message: 'Producto creado', id: result.insertId });
    } catch (err) {
        console.error("🔥 Error POST productos:", err);
        res.status(500).json({ status: 'error', message: 'Error al crear el producto' });
    }
});

app.delete('/api/productos/:id', verificarToken, async (req, res) => {
    const { id } = req.params;
    const usuario_id = req.usuario.id;
    try {
        await pool.query('DELETE FROM productos WHERE id = ? AND usuario_id = ?', [id, usuario_id]);
        res.json({ status: 'success', message: 'Producto eliminado' });
    } catch (err) {
        console.error("🔥 Error DELETE productos:", err);
        res.status(500).json({ status: 'error', message: 'Error al eliminar el producto' });
    }
});

// --- RUTA PÚBLICA BLINDADA ---
app.get('/api/facturas/publica/:param', async (req, res) => {
    try {
        const { param } = req.params;

        const [facturas] = await pool.query(
            `SELECT f.*, c.nombre AS cliente_nombre, c.email AS cliente_email, 
                    c.telefono AS cliente_telefono, c.direccion AS cliente_direccion
             FROM facturas f
             LEFT JOIN clientes c ON f.cliente_id = c.id
             WHERE f.id = ? OR f.numero_factura = ?`,
            [param, param]
        );

        if (facturas.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Factura no encontrada' });
        }

        const factura = facturas[0];

        const [detalles] = await pool.query(
            'SELECT * FROM detalles_factura WHERE factura_id = ?',
            [factura.id]
        );

        factura.detalles = detalles;

        res.json({
            status: 'success',
            data: factura
        });
    } catch (error) {
        console.error('Error al obtener factura pública:', error);
        res.status(500).json({ status: 'error', message: 'Error en el servidor' });
    }
});

// --- ARRANCAR SERVIDOR ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});