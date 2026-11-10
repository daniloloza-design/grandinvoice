const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.getConnection((err, connection) => {
  if (err) {
    console.error('Error conectando a MySQL en Banahosting:', err);
  } else {
    console.log('¡Conectado exitosamente a la base de datos MySQL!');
    connection.release();
  }
});

module.exports = db.promise();