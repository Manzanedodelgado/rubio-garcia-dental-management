const authMiddleware = (req, res, next) => {
  // Middleware de autenticación básico
  // En una implementación real, usaríamos JWT o sesiones
  
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: 'Token de autenticación requerido'
    });
  }

  // Simulación de validación de token
  // En producción, validar contra base de datos o JWT
  if (authHeader !== 'Bearer admin-token' && process.env.NODE_ENV !== 'development') {
    return res.status(403).json({
      success: false,
      error: 'Token inválido o expirado'
    });
  }

  next();
};

module.exports = authMiddleware;