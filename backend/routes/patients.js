const express = require('express');
const router = express.Router();
const patientsController = require('../controllers/patientsController');

// GET /api/patients - Obtener directorio de pacientes
router.get('/', patientsController.getPatients);

// GET /api/patients/stats - Estadísticas de pacientes
router.get('/stats', patientsController.getPatientStats);

// GET /api/patients/search - Buscar pacientes
router.get('/search', patientsController.searchPatients);

module.exports = router;