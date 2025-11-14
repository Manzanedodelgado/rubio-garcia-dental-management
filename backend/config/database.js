const sql = require('mssql');

const dbConfig = {
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
    connectTimeout: 60000,
    requestTimeout: 60000
  }
};

class DatabaseManager {
  constructor() {
    this.pool = null;
    this.isConnecting = false;
  }

  async connect() {
    try {
      if (this.pool && this.pool.connected) {
        return this.pool;
      }

      if (this.isConnecting) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.connect();
      }

      this.isConnecting = true;
      console.log('🔗 Conectando a SQL Server...');
      
      this.pool = await sql.connect(dbConfig);
      this.isConnecting = false;
      
      console.log('✅ Conexión a SQL Server establecida');
      return this.pool;
    } catch (error) {
      this.isConnecting = false;
      console.error('❌ Error conectando a SQL Server:', error.message);
      throw error;
    }
  }

  async close() {
    if (this.pool) {
      await this.pool.close();
      this.pool = null;
      console.log('🔒 Conexión a SQL Server cerrada');
    }
  }

  async testConnection() {
    try {
      const pool = await this.connect();
      const result = await pool.request().query('SELECT @@VERSION as version');
      return {
        success: true,
        version: result.recordset[0].version,
        database: dbConfig.database
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new DatabaseManager();