const express = require('express');
const router = express.Router();
const appointmentsController = require('../controllers/appointmentsController');

// GET /api/appointments - Obtener todas las citas
router.get('/', appointmentsController.getAppointments);

// GET /api/appointments/sql - Sincronizar con SQL Server
router.get('/sql', appointmentsController.syncFromSQL);

// POST /api/appointments/sync - Sincronizar hacia SQL Server
router.post('/sync', appointmentsController.syncToSQL);

// GET /api/appointments/stats - Estadísticas de citas
router.get('/stats', appointmentsController.getStats);

// GET /api/appointments/today - Citas de hoy
router.get('/today', appointmentsController.getTodayAppointments);

module.exports = router;