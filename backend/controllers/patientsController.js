const db = require('../config/database');

class PatientsController {
  async getPatients(req, res) {
    try {
      const { search, page = 1, limit = 50 } = req.query;
      
      const pool = await db.connect();
      
      let query = `
        SELECT DISTINCT
          RTRIM(NombrePaciente) as nombre,
          RTRIM(ApellidosPaciente) as apellidos,
          TelefonoPaciente as telefono,
          EmailPaciente as email,
          COUNT(IdCita) as total_citas,
          MAX(FechaCita) as ultima_cita
        FROM dbo.DCitas
        WHERE NombrePaciente IS NOT NULL AND NombrePaciente != ''
      `;

      if (search) {
        query += ` AND (NombrePaciente LIKE @search OR ApellidosPaciente LIKE @search OR TelefonoPaciente LIKE @search)`;
      }

      query += ` GROUP BY NombrePaciente, ApellidosPaciente, TelefonoPaciente, EmailPaciente
                 ORDER BY apellidos, nombre
                 OFFSET ${(page - 1) * limit} ROWS 
                 FETCH NEXT ${limit} ROWS ONLY`;

      const request = pool.request();
      if (search) {
        request.input('search', `%${search}%`);
      }

      const result = await request.query(query);
      
      res.json({
        success: true,
        data: result.recordset,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: result.recordset.length
        }
      });

    } catch (error) {
      console.error('Error en getPatients:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getPatientStats(req, res) {
    try {
      const pool = await db.connect();
      
      const query = `
        SELECT 
          COUNT(DISTINCT NombrePaciente + ApellidosPaciente) as total_pacientes,
          COUNT(*) as total_citas,
          AVG(CAST(COUNT(*) as float)) OVER () as promedio_citas_por_paciente,
          MAX(FechaCita) as ultima_cita_registrada
        FROM dbo.DCitas
        WHERE NombrePaciente IS NOT NULL
      `;

      const result = await pool.request().query(query);
      
      res.json({
        success: true,
        data: result.recordset[0]
      });

    } catch (error) {
      console.error('Error en getPatientStats:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async searchPatients(req, res) {
    try {
      const { q } = req.query;
      
      if (!q || q.length < 2) {
        return res.json({
          success: true,
          data: [],
          message: 'Término de búsqueda muy corto'
        });
      }

      const pool = await db.connect();
      
      const query = `
        SELECT DISTINCT TOP 10
          RTRIM(NombrePaciente) as nombre,
          RTRIM(ApellidosPaciente) as apellidos,
          TelefonoPaciente as telefono,
          EmailPaciente as email
        FROM dbo.DCitas
        WHERE (NombrePaciente LIKE @search OR ApellidosPaciente LIKE @search OR TelefonoPaciente LIKE @search)
          AND NombrePaciente IS NOT NULL
        ORDER BY apellidos, nombre
      `;

      const request = pool.request();
      request.input('search', `%${q}%`);

      const result = await request.query(query);
      
      res.json({
        success: true,
        data: result.recordset,
        total: result.recordset.length
      });

    } catch (error) {
      console.error('Error en searchPatients:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new PatientsController();