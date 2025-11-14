const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de seguridad
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de 100 requests por ventana
});
app.use(limiter);

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Importar rutas
const appointmentsRoutes = require('./routes/appointments');
const patientsRoutes = require('./routes/patients');
const whatsappRoutes = require('./routes/whatsapp');

// Usar rutas
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/whatsapp', whatsappRoutes);

// Ruta de health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Sistema Rubio García Dental funcionando',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Ruta principal
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenido al Sistema de Gestión Rubio García Dental',
    endpoints: {
      health: '/api/health',
      appointments: '/api/appointments',
      patients: '/api/patients',
      whatsapp: '/api/whatsapp'
    }
  });
});

// Manejo de errores 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    message: `La ruta ${req.originalUrl} no existe`
  });
});

// Manejo global de errores
app.use((error, req, res, next) => {
  console.error('Error global:', error);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Contacte con soporte'
  });
});

// Inicializar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
🦷 Rubio García Dental Management System
📍 Servidor ejecutándose en puerto: ${PORT}
⏰ Iniciado: ${new Date().toLocaleString('es-ES')}
🌐 Ambiente: ${process.env.NODE_ENV || 'development'}
  `);
});

module.exports = app;