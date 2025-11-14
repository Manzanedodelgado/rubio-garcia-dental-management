// ========================================
// RUBIO GARCÍA DENTAL - Aplicación Principal
// ========================================

class DentalApp {
    constructor() {
        this.currentUser = null;
        this.appointments = [];
        this.patients = [];
        this.isInitialized = false;
        this.apiBaseUrl = 'http://localhost:3000/api';
    }

    async initialize() {
        try {
            console.log('🦷 Inicializando Rubio García Dental App...');
            
            // Verificar conexión al backend
            await this.checkBackendConnection();
            
            // Cargar datos iniciales
            await this.loadInitialData();
            
            // Configurar event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('✅ Aplicación inicializada correctamente');
            
        } catch (error) {
            console.error('❌ Error inicializando aplicación:', error);
            this.showError('Error al inicializar la aplicación: ' + error.message);
        }
    }

    async checkBackendConnection() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/health`);
            const data = await response.json();
            
            if (data.status === 'ok') {
                this.showNotification('✅ Conectado al servidor', 'success');
            } else {
                throw new Error('Servidor no responde correctamente');
            }
        } catch (error) {
            throw new Error('No se pudo conectar al servidor backend');
        }
    }

    async loadInitialData() {
        try {
            // Cargar citas
            const appointmentsResponse = await fetch(`${this.apiBaseUrl}/appointments/sql`);
            const appointmentsData = await appointmentsResponse.json();
            
            if (appointmentsData.success) {
                this.appointments = appointmentsData.data;
                this.renderAppointments();
            }

            // Cargar pacientes
            const patientsResponse = await fetch(`${this.apiBaseUrl}/patients`);
            const patientsData = await patientsResponse.json();
            
            if (patientsData.success) {
                this.patients = patientsData.data;
                this.renderPatients();
            }

            // Actualizar dashboard
            this.updateDashboard();

        } catch (error) {
            console.error('Error cargando datos iniciales:', error);
            this.showError('Error cargando datos: ' + error.message);
        }
    }

    setupEventListeners() {
        // Login form
        document.getElementById('login-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Toggle password visibility
        document.getElementById('toggle-password')?.addEventListener('click', () => {
            this.togglePasswordVisibility();
        });

        // Logout button
        document.addEventListener('click', (e) => {
            if (e.target.closest('#logout-btn')) {
                this.handleLogout();
            }
        });

        // Sync button
        document.addEventListener('click', (e) => {
            if (e.target.closest('#sync-appointments')) {
                this.syncAppointments();
            }
        });
    }

    async handleLogin() {
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        // Validación básica
        if (!username || !password) {
            this.showError('Por favor ingrese usuario y contraseña');
            return;
        }

        try {
            // Simular login (en producción, usar autenticación real)
            if (username === 'admin' && password === 'admin') {
                this.currentUser = {
                    id: 1,
                    username: 'admin',
                    name: 'Dr. Rubio García',
                    role: 'admin'
                };

                // Ocultar login, mostrar app
                document.getElementById('login-screen').classList.add('hidden');
                document.getElementById('main-app').classList.remove('hidden');
                
                // Inicializar aplicación principal
                await this.initializeMainApp();
                
                this.showNotification('¡Bienvenido Dr. Rubio García!', 'success');
            } else {
                this.showError('Credenciales incorrectas. Use admin/admin');
            }
        } catch (error) {
            this.showError('Error en el login: ' + error.message);
        }
    }

    async initializeMainApp() {
        // Cargar el HTML de la aplicación principal
        await this.loadMainAppTemplate();
        
        // Configurar la aplicación principal
        this.setupMainApp();
    }

    async loadMainAppTemplate() {
        // En una implementación real, cargaríamos templates separados
        // Por ahora, usamos el HTML embebido en index.html
        
        const mainAppHTML = `
            <header class="corporate-gradient shadow-sm border-b border-orange-400">
                <div class="flex items-center justify-between px-6 py-4">
                    <div class="flex items-center space-x-4">
                        <div class="logo-container">
                            <div class="w-12 h-12 corporate-gradient rounded-xl flex items-center justify-center p-1 logo-border">
                                <img src="https://i.ibb.co/sd2Q9Lsn/B938-D892-C1-E0-4-E3-E-A9-F7-CA44-E05672-E1.png" 
                                     alt="Logo" 
                                     class="w-full h-full object-contain rounded-lg">
                            </div>
                            <div>
                                <h1 class="clinic-name">RUBIO GARCÍA DENTAL</h1>
                                <p class="clinic-slogan">Sistema Integral de Gestión</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex items-center space-x-4">
                        <div class="text-right">
                            <p class="text-sm font-medium text-white">${this.currentUser.name}</p>
                            <p class="text-white/80 text-xs">${this.currentUser.role}</p>
                        </div>
                        <button id="logout-btn" class="p-2 text-white/80 hover:text-white transition-colors" title="Cerrar sesión">
                            🚪
                        </button>
                    </div>
                </div>
            </header>

            <div class="flex h-screen">
                <!-- Sidebar -->
                <nav class="w-64 bg-white border-r border-gray-200">
                    <div class="p-4">
                        <button id="sync-appointments" class="btn-dental-primary w-full mb-4">
                            🔄 Sincronizar Citas
                        </button>
                        
                        <div class="space-y-2">
                            <button class="w-full text-left p-3 rounded-lg hover:bg-blue-50 text-primary-600 font-medium transition-colors">
                                📊 Dashboard
                            </button>
                            <button class="w-full text-left p-3 rounded-lg hover:bg-blue-50 text-primary-600 font-medium transition-colors">
                                📅 Agenda de Citas
                            </button>
                            <button class="w-full text-left p-3 rounded-lg hover:bg-blue-50 text-primary-600 font-medium transition-colors">
                                👥 Pacientes
                            </button>
                            <button class="w-full text-left p-3 rounded-lg hover:bg-blue-50 text-primary-600 font-medium transition-colors">
                                💬 WhatsApp
                            </button>
                            <button class="w-full text-left p-3 rounded-lg hover:bg-blue-50 text-primary-600 font-medium transition-colors">
                                ⚙️ Configuración
                            </button>
                        </div>
                    </div>
                </nav>

                <!-- Main Content -->
                <main class="flex-1 p-6 overflow-auto">
                    <div class="mb-6">
                        <h2 class="text-2xl font-bold text-primary-900">Dashboard</h2>
                        <p class="text-primary-600">Resumen de actividad y métricas</p>
                    </div>

                    <!-- Stats Cards -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div class="dental-card p-6">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm font-medium text-gray-600">Citas Hoy</p>
                                    <p id="today-appointments-count" class="text-2xl font-bold text-primary-600">0</p>
                                </div>
                                <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                                    <span class="text-primary-600 text-xl">📅</span>
                                </div>
                            </div>
                        </div>

                        <div class="dental-card p-6">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm font-medium text-gray-600">Pacientes</p>
                                    <p id="total-patients-count" class="text-2xl font-bold text-primary-600">0</p>
                                </div>
                                <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                                    <span class="text-primary-600 text-xl">👥</span>
                                </div>
                            </div>
                        </div>

                        <div class="dental-card p-6">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm font-medium text-gray-600">WhatsApp</p>
                                    <p class="text-2xl font-bold text-primary-600">💚</p>
                                </div>
                                <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                                    <span class="text-primary-600 text-xl">💬</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Appointments List -->
                    <div class="dental-card">
                        <div class="dental-card-header">
                            <h3 class="font-semibold text-primary-900">Próximas Citas</h3>
                        </div>
                        <div id="appointments-list" class="p-4">
                            <!-- Las citas se cargarán aquí -->
                        </div>
                    </div>
                </main>
            </div>
        `;

        document.getElementById('main-app').innerHTML = mainAppHTML;
    }

    setupMainApp() {
        // Configurar event listeners específicos de la app principal
        document.getElementById('sync-appointments').addEventListener('click', () => {
            this.syncAppointments();
        });
    }

    async syncAppointments() {
        try {
            this.showNotification('🔄 Sincronizando citas...', 'info');
            
            const response = await fetch(`${this.apiBaseUrl}/appointments/sql`);
            const data = await response.json();
            
            if (data.success) {
                this.appointments = data.data;
                this.renderAppointments();
                this.updateDashboard();
                this.showNotification(`✅ ${data.data.length} citas sincronizadas`, 'success');
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            this.showError('Error sincronizando citas: ' + error.message);
        }
    }

    renderAppointments() {
        const container = document.getElementById('appointments-list');
        if (!container) return;

        if (this.appointments.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <p>No hay citas programadas</p>
                    <button class="btn-dental-primary mt-2" onclick="app.syncAppointments()">
                        Sincronizar Citas
                    </button>
                </div>
            `;
            return;
        }

        const todayAppointments = this.appointments.filter(apt => {
            const aptDate = new Date(apt.fecha).toDateString();
            const today = new Date().toDateString();
            return aptDate === today;
        });

        container.innerHTML = todayAppointments.map(appointment => `
            <div class="flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span class="text-primary-600 font-semibold">
                            ${appointment.nombre?.charAt(0) || 'P'}
                        </span>
                    </div>
                    <div>
                        <h4 class="font-medium text-gray-800">
                            ${appointment.nombre} ${appointment.apellidos}
                        </h4>
                        <p class="text-sm text-gray-600">${appointment.doctor} - ${appointment.hora}</p>
                    </div>
                </div>
                <span class="status-badge status-${appointment.estado}">
                    ${appointment.estado}
                </span>
            </div>
        `).join('');
    }

    renderPatients() {
        // Implementar renderizado de pacientes
        console.log('Pacientes cargados:', this.patients.length);
    }

    updateDashboard() {
        // Actualizar contadores del dashboard
        const todayCount = this.appointments.filter(apt => {
            const aptDate = new Date(apt.fecha).toDateString();
            const today = new Date().toDateString();
            return aptDate === today;
        }).length;

        const todayElement = document.getElementById('today-appointments-count');
        const patientsElement = document.getElementById('total-patients-count');

        if (todayElement) todayElement.textContent = todayCount;
        if (patientsElement) patientsElement.textContent = this.patients.length;
    }

    togglePasswordVisibility() {
        const passwordInput = document.getElementById('login-password');
        const toggleButton = document.getElementById('toggle-password');
        
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        toggleButton.textContent = type === 'password' ? '👁️' : '🔒';
    }

    handleLogout() {
        this.currentUser = null;
        this.appointments = [];
        this.patients = [];
        
        document.getElementById('main-app').classList.add('hidden');
        document.getElementById('login-screen').classList.remove('hidden');
        
        // Limpiar formulario de login
        document.getElementById('login-form').reset();
        
        this.showNotification('Sesión cerrada correctamente', 'info');
    }

    showNotification(message, type = 'info') {
        // Crear notificación
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 fade-in ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Auto-remover después de 5 segundos
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    showError(message) {
        this.showNotification(message, 'error');
    }
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.app = new DentalApp();
});