const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class SQLSyncService {
  constructor() {
    this.lastSync = null;
    this.syncHistory = [];
  }

  async syncAppointmentsToSQL(appointments) {
    const transaction = new (require('mssql')).Transaction(await db.connect());
    
    try {
      await transaction.begin();

      const results = {
        created: 0,
        updated: 0,
        errors: []
      };

      for (const appointment of appointments) {
        try {
          // Verificar si existe
          const exists = await this.checkAppointmentExists(transaction, appointment);
          
          if (exists) {
            await this.updateAppointment(transaction, appointment, exists.IdCita);
            results.updated++;
          } else {
            await this.createAppointment(transaction, appointment);
            results.created++;
          }
        } catch (error) {
          results.errors.push({
            appointment: appointment.nombre,
            error: error.message
          });
        }
      }

      await transaction.commit();

      // Registrar en historial
      this.recordSync('export', results, appointments.length);

      return results;

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async checkAppointmentExists(transaction, appointment) {
    const request = new (require('mssql')).Request(transaction);
    
    const query = `
      SELECT IdCita FROM dbo.DCitas 
      WHERE IdCita = @id OR 
            (NombrePaciente = @nombre AND ApellidosPaciente = @apellidos 
             AND FechaCita = @fecha AND HoraCita = @hora)
    `;

    request.input('id', appointment.id || '');
    request.input('nombre', appointment.nombre || '');
    request.input('apellidos', appointment.apellidos || '');
    request.input('fecha', appointment.fecha || '');
    request.input('hora', appointment.hora || '');

    const result = await request.query(query);
    return result.recordset.length > 0 ? result.recordset[0] : null;
  }

  async createAppointment(transaction, appointment) {
    const request = new (require('mssql')).Request(transaction);
    
    const query = `
      INSERT INTO dbo.DCitas (
        IdCita, FechaCita, HoraCita, NombrePaciente, ApellidosPaciente,
        TelefonoPaciente, EmailPaciente, NombreDoctor, TipoTratamiento,
        EstadoCita, Observaciones, FechaCreacion, FechaModificacion
      ) VALUES (
        @idCita, @fechaCita, @horaCita, @nombrePaciente, @apellidosPaciente,
        @telefonoPaciente, @emailPaciente, @nombreDoctor, @tipoTratamiento,
        @estadoCita, @observaciones, GETDATE(), GETDATE()
      )
    `;

    request.input('idCita', appointment.id || uuidv4());
    request.input('fechaCita', appointment.fecha);
    request.input('horaCita', appointment.hora);
    request.input('nombrePaciente', appointment.nombre);
    request.input('apellidosPaciente', appointment.apellidos);
    request.input('telefonoPaciente', appointment.telefono);
    request.input('emailPaciente', appointment.email || '');
    request.input('nombreDoctor', appointment.doctor);
    request.input('tipoTratamiento', appointment.tratamiento || 'Consulta general');
    request.input('estadoCita', this.mapStatusToSQL(appointment.estado));
    request.input('observaciones', appointment.notas || '');

    await request.query(query);
  }

  async updateAppointment(transaction, appointment, idCita) {
    const request = new (require('mssql')).Request(transaction);
    
    const query = `
      UPDATE dbo.DCitas SET
        FechaCita = @fechaCita,
        HoraCita = @horaCita,
        NombrePaciente = @nombrePaciente,
        ApellidosPaciente = @apellidosPaciente,
        TelefonoPaciente = @telefonoPaciente,
        EmailPaciente = @emailPaciente,
        NombreDoctor = @nombreDoctor,
        TipoTratamiento = @tipoTratamiento,
        EstadoCita = @estadoCita,
        Observaciones = @observaciones,
        FechaModificacion = GETDATE()
      WHERE IdCita = @idCita
    `;

    request.input('idCita', idCita);
    request.input('fechaCita', appointment.fecha);
    request.input('horaCita', appointment.hora);
    request.input('nombrePaciente', appointment.nombre);
    request.input('apellidosPaciente', appointment.apellidos);
    request.input('telefonoPaciente', appointment.telefono);
    request.input('emailPaciente', appointment.email || '');
    request.input('nombreDoctor', appointment.doctor);
    request.input('tipoTratamiento', appointment.tratamiento || 'Consulta general');
    request.input('estadoCita', this.mapStatusToSQL(appointment.estado));
    request.input('observaciones', appointment.notas || '');

    await request.query(query);
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

  recordSync(type, results, total) {
    const syncRecord = {
      type,
      timestamp: new Date(),
      results,
      total,
      duration: 0 // Se calcularía en implementación real
    };
    
    this.syncHistory.push(syncRecord);
    
    // Mantener solo últimos 100 registros
    if (this.syncHistory.length > 100) {
      this.syncHistory = this.syncHistory.slice(-100);
    }
  }

  getSyncHistory() {
    return this.syncHistory;
  }
}

module.exports = new SQLSyncService();