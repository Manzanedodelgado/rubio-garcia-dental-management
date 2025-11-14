# Rubio García Dental - Configuración SQL Server Remoto
# Ejecutar como Administrador

Write-Host "🦷 Configurando SQL Server para conexiones remotas..." -ForegroundColor Green

# 1. Configurar firewall
Write-Host "`n1. Configurando firewall..." -ForegroundColor Yellow
try {
    # Verificar si la regla ya existe
    $existingRule = Get-NetFirewallRule -DisplayName "SQL Server" -ErrorAction SilentlyContinue
    
    if (-not $existingRule) {
        New-NetFirewallRule -DisplayName "SQL Server" -Direction Inbound -Protocol TCP -LocalPort 1433 -Action Allow
        Write-Host "   ✅ Regla de firewall creada" -ForegroundColor Green
    } else {
        Write-Host "   ℹ️  Regla de firewall ya existe" -ForegroundColor Blue
    }
} catch {
    Write-Host "   ❌ Error configurando firewall: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Obtener información de red
Write-Host "`n2. Información de red:" -ForegroundColor Yellow
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -like "*Ethernet*" -or $_.InterfaceAlias -like "*Wi-Fi*"} | Select-Object -First 1).IPAddress
$computerName = $env:COMPUTERNAME

Write-Host "   Nombre del equipo: $computerName" -ForegroundColor White
Write-Host "   Dirección IP: $ipAddress" -ForegroundColor White

# 3. Instrucciones para SQL Server
Write-Host "`n3. Configuración manual en SQL Server:" -ForegroundColor Yellow
Write-Host @"
   🔧 Pasos a seguir en SQL Server Management Studio:

   1. Ejecutar este script SQL:
   
   -- Habilitar conexiones remotas
   EXEC sys.sp_configure N'remote access', N'1'
   RECONFIGURE WITH OVERRIDE
   GO

   EXEC sys.sp_configure N'remote admin connections', N'1' 
   RECONFIGURE WITH OVERRIDE
   GO

   2. En SQL Server Configuration Manager:
      - SQL Server Network Configuration → Protocols → TCP/IP → Habilitar
      - Reiniciar servicio SQL Server

   3. Crear usuario para la aplicación (opcional):
   
   CREATE LOGIN [dental_app_user] WITH PASSWORD = 'TuPasswordSeguro123!'
   GO
   
   USE [GELITE]
   GO
   CREATE USER [dental_app_user] FOR LOGIN [dental_app_user]
   GO
   
   EXEC sp_addrolemember 'db_owner', 'dental_app_user'
   GO
"@ -ForegroundColor Cyan

# 4. Mostrar ejemplos de conexión
Write-Host "`n4. Ejemplos de configuración .env:" -ForegroundColor Yellow
Write-Host @"
   💻 Para conexión LOCAL (mismo PC):
   DB_SERVER=$computerName
   DB_NAME=GELITE
   DB_USER=RUBIOGARCIADENTAL
   DB_PASSWORD=666666

   🌐 Para conexión REMOTA (desde otro PC):
   DB_SERVER=$ipAddress
   DB_NAME=GELITE  
   DB_USER=RUBIOGARCIADENTAL
   DB_PASSWORD=666666
"@ -ForegroundColor Magenta

Write-Host "`n🎉 Configuración completada!" -ForegroundColor Green
Write-Host "   Recuerda reiniciar el servicio SQL Server después de los cambios" -ForegroundColor Yellow