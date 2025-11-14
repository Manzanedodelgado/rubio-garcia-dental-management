const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsappController');

// GET /api/whatsapp/status - Estado de conexión WhatsApp
router.get('/status', whatsappController.getStatus);

// POST /api/whatsapp/send - Enviar mensaje
router.post('/send', whatsappController.sendMessage);

// POST /api/whatsapp/bulk - Envío masivo
router.post('/bulk', whatsappController.sendBulkMessages);

// GET /api/whatsapp/qr - Obtener QR para conectar
router.get('/qr', whatsappController.getQR);

module.exports = router;