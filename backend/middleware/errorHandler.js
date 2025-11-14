const errorHandler = (error, req, res, next) => {
  console.error('Error capturado:', error);

  // Error de base de datos
  if (error.name === 'ConnectionError') {
    return res.status(503).json({
      success: false,
      error: 'Error de conexión a la base de datos',
      message: 'No se pudo conectar con SQL Server'
    });
  }

  // Error de validación
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Error de validación',
      details: error.details
    });
  }

  // Error genérico
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Contacte con soporte técnico'
  });
};

module.exports = errorHandler;