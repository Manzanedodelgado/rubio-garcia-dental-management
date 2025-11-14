
### **25. scripts/setup.sh**
```bash
#!/bin/bash

# ========================================
# Rubio García Dental - Setup Script
# ========================================

echo "🦷 Rubio García Dental - Setup del Sistema"
echo "=========================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir con color
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar Node.js
check_nodejs() {
    print_status "Verificando Node.js..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js encontrado: $NODE_VERSION"
    else
        print_error "Node.js no encontrado. Por favor instale Node.js 16+"
        exit 1
    fi
}

# Verificar npm
check_npm() {
    print_status "Verificando npm..."
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm encontrado: $NPM_VERSION"
    else
        print_error "npm no encontrado"
        exit 1
    fi
}

# Instalar dependencias del backend
install_backend_dependencies() {
    print_status "Instalando dependencias del backend..."
    cd backend
    
    if npm install; then
        print_success "Dependencias del backend instaladas correctamente"
    else
        print_error "Error instalando dependencias del backend"
        exit 1
    fi
    
    cd ..
}

# Configurar archivo de environment
setup_environment() {
    print_status "Configurando variables de entorno..."
    
    if [ ! -f "backend/.env" ]; then
        cp backend/.env.example backend/.env
        print_success "Archivo .env creado. Por favor edítelo con su configuración"
    else
        print_warning "Archivo .env ya existe, omitiendo..."
    fi
}

# Verificar estructura de directorios
check_directories() {
    print_status "Verificando estructura de directorios..."
    
    DIRECTORIES=(
        "backend/logs"
        "backend/sessions"
        "frontend/assets"
        "database/backups"
    )
    
    for dir in "${DIRECTORIES[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            print_success "Directorio creado: $dir"
        else
            print_warning "Directorio ya existe: $dir"
        fi
    done
}

# Configurar permisos
setup_permissions() {
    print_status "Configurando permisos..."
    
    # Dar permisos de ejecución a los scripts
    chmod +x scripts/*.sh
    
    print_success "Permisos configurados"
}

# Mostrar resumen de instalación
show_summary() {
    echo ""
    echo "=========================================="
    echo "🎉 SETUP COMPLETADO EXITOSAMENTE"
    echo "=========================================="
    echo ""
    echo "📋 Próximos pasos:"
    echo "1. Editar el archivo backend/.env con su configuración"
    echo "2. Configurar la base de datos ejecutando database/setup.sql"
    echo "3. Iniciar el servidor: cd backend && npm run dev"
    echo "4. Abrir http://localhost:3000 en el navegador"
    echo ""
    echo "🔧 Configuración de base de datos requerida:"
    echo "   - Servidor: GABINETE2\\INFOMED"
    echo "   - Base de datos: GELITE"
    echo "   - Usuario: RUBIOGARCIADENTAL"
    echo ""
    echo "📞 Para soporte: soporte@rubiogarciadental.com"
    echo ""
}

# Función principal
main() {
    echo "Iniciando setup del sistema..."
    echo ""
    
    check_nodejs
    check_npm
    check_directories
    install_backend_dependencies
    setup_environment
    setup_permissions
    show_summary
}

# Ejecutar función principal
main