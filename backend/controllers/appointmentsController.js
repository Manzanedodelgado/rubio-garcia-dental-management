const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class AppointmentsController {
  async getAppointments(req, res) {
    try {
      const { fecha, doctor, estado, page = 1, limit = 100 } = req.query;
      
      const pool = await db.connect();
      
      let query = `
        SELECT 
          IdCita,
          FechaCita,
          HoraCita,
          NombrePaciente,
          ApellidosPaciente,
          TelefonoPaciente,
          EmailPaciente,
          NombreDoctor,
          TipoTratamiento,
          EstadoCita,
          Observaciones,
          FechaCreacion,
          FechaModificacion
        FROM dbo.DCitas 
        WHERE 1=1
      `;
      
      const params = [];

      if (fecha) {
        query += ` AND CONVERT(DATE, FechaCita) = CONVERT(DATE, @fecha)`;
        params.push({ name: 'fecha', value: fecha });
      }
      
      if (doctor) {
        query += ` AND NombreDoctor LIKE @doctor`;
        params.push({ name: 'doctor', value: `%${doctor}%` });
      }
      
      if (estado) {
        query += ` AND EstadoCita = @estado`;
        params.push({ name: 'estado', value: estado });
      }

      query += ` ORDER BY FechaCita DESC, HoraCita DESC 
                 OFFSET ${(page - 1) * limit} ROWS 
                 FETCH NEXT ${limit} ROWS ONLY`;

      const request = pool.request();
      params.forEach(param => {
        request.input(param.name, param.value);
      });

      const result = await request.query(query);
      
      // Mapear datos para el frontend
      const mappedData = result.recordset.map(cita => ({
        id: cita.IdCita,
        sql_id: cita.IdCita,
        nombre: cita.NombrePaciente,
        apellidos: cita.ApellidosPaciente,
        telefono: cita.TelefonoPaciente,
        email: cita.EmailPaciente,
        fecha: cita.FechaCita,
        hora: cita.HoraCita,
        doctor: cita.NombreDoctor,
        tratamiento: cita.TipoTratamiento,
        estado: this.mapStatusFromSQL(cita.EstadoCita),
        notas: cita.Observaciones,
        fecha_creacion: cita.FechaCreacion,
        fecha_modificacion: cita.FechaModificacion
      }));

      res.json({
        success: true,
        data: mappedData,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: result.recordset.length
        }
      });

    } catch (error) {
      console.error('Error en getAppointments:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async syncFromSQL(req, res) {
    try {
      const pool = await db.connect();
      const result = await pool.request().query(`
        SELECT TOP 1000 * FROM dbo.DCitas 
        ORDER BY FechaCita DESC, HoraCita DESC
      `);

      const mappedData = result.recordset.map(cita => ({
        id: cita.IdCita,
        sql_id: cita.IdCita,
        nombre: cita.NombrePaciente,
        apellidos: cita.ApellidosPaciente,
        telefono: cita.TelefonoPaciente,
        email: cita.EmailPaciente,
        fecha: cita.FechaCita,
        hora: cita.HoraCita,
        doctor: cita.NombreDoctor,
        tratamiento: cita.TipoTratamiento,
        estado: this.mapStatusFromSQL(cita.EstadoCita),
        notas: cita.Observaciones
      }));

      res.json({
        success: true,
        data: mappedData,
        total: mappedData.length,
        syncTime: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error en syncFromSQL:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  mapStatusFromSQL(sqlStatus) {
    const statusMap = {
      'P': 'pendiente',
      'C': 'confirmada',
      'F': 'completada',
      'A': 'cancelada'
    };
    return statusMap[sqlStatus] || 'pendiente';
  }

  mapStatusToSQL(appStatus) {
    const statusMap = {
      'pendiente': 'P',
      'confirmada': 'C',
      'completada': 'F',
      'cancelada': 'A'
    };
    return statusMap[appStatus] || 'P';
  }
}

module.exports = new AppointmentsController();