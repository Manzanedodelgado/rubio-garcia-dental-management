// Al final del archivo server.js, modificar:
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
🦷 Rubio García Dental Management System
📍 Servidor ejecutándose en: http://0.0.0.0:${PORT}
🌐 Accesible desde: http://localhost:${PORT} o http://[IP-DEL-PC]:${PORT}
⏰ Iniciado: ${new Date().toLocaleString('es-ES')}
🔗 Base de datos: ${process.env.DB_SERVER}
  `);
});