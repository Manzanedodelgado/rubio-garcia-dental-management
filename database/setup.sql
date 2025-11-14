-- ========================================
-- RUBIO GARCÍA DENTAL - Setup Database
-- ========================================

USE GELITE;

-- Tabla de auditoría de sincronizaciones
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='SyncAudit' AND xtype='U')
BEGIN
    CREATE TABLE dbo.SyncAudit (
        IdSync INT IDENTITY(1,1) PRIMARY KEY,
        FechaSync DATETIME DEFAULT GETDATE(),
        TipoSync VARCHAR(20), -- 'import', 'export', 'auto'
        RegistrosProcesados INT,
        Estado VARCHAR(20), -- 'success', 'error'
        Detalles NVARCHAR(MAX),
        Usuario VARCHAR(100)
    );
    
    PRINT '✅ Tabla SyncAudit creada';
END

-- Índices para mejorar rendimiento
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_DCitas_Fecha' AND object_id = OBJECT_ID('dbo.DCitas'))
BEGIN
    CREATE INDEX IX_DCitas_Fecha ON dbo.DCitas (FechaCita);
    PRINT '✅ Índice IX_DCitas_Fecha creado';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_DCitas_Estado' AND object_id = OBJECT_ID('dbo.DCitas'))
BEGIN
    CREATE INDEX IX_DCitas_Estado ON dbo.DCitas (EstadoCita);
    PRINT '✅ Índice IX_DCitas_Estado creado';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_DCitas_Doctor' AND object_id = OBJECT_ID('dbo.DCitas'))
BEGIN
    CREATE INDEX IX_DCitas_Doctor ON dbo.DCitas (NombreDoctor);
    PRINT '✅ Índice IX_DCitas_Doctor creado';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_DCitas_Paciente' AND object_id = OBJECT_ID('dbo.DCitas'))
BEGIN
    CREATE INDEX IX_DCitas_Paciente ON dbo.DCitas (NombrePaciente, ApellidosPaciente);
    PRINT '✅ Índice IX_DCitas_Paciente creado';
END

PRINT '========================================';
PRINT '🦷 Base de datos configurada correctamente';
PRINT '📍 Clínica Dental Rubio García';
PRINT '========================================';