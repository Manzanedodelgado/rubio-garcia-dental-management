const sql = require('mssql');

async function diagnoseConnection() {
  console.log('🔍 Diagnóstico de conexión SQL Server...\n');
  
  const configs = [
    {
      name: 'Configuración actual (.env)',
      server: process.env.DB_SERVER,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT) || 1433
    },
    {
      name: 'Conexión local por nombre',
      server: 'GABINETE2\\INFOMED',
      database: 'GELITE',
      user: 'RUBIOGARCIADENTAL',
      password: '666666',
      port: 1433
    },
    {
      name: 'Conexión local por localhost',
      server: 'localhost',
      database: 'GELITE',
      user: 'RUBIOGARCIADENTAL',
      password: '666666',
      port: 1433
    }
  ];

  for (const config of configs) {
    console.log(`\n🧪 Probando: ${config.name}`);
    console.log(`   Servidor: ${config.server}`);
    
    try {
      const pool = await sql.connect(config);
      const result = await pool.request().query('SELECT @@VERSION as version');
      console.log('   ✅ CONEXIÓN EXITOSA');
      console.log(`   📋 SQL Server: ${result.recordset[0].version.split('\n')[0]}`);
      await pool.close();
    } catch (error) {
      console.log('   ❌ ERROR:', error.message);
    }
  }
  
  console.log('\n📋 Resumen de configuración:');
  console.log('   Para conexión LOCAL usar: GABINETE2\\INFOMED');
  console.log('   Para conexión REMOTA usar: IP del servidor (ej: 192.168.1.100)');
  console.log('   Asegúrate de que el firewall permite el puerto 1433');
}

// Ejecutar diagnóstico
diagnoseConnection().catch(console.error);