<template>
  <q-layout view="hHh lpR fFf" class="main-layout">
    <q-header elevated class="bg-deep-purple-10 text-white animate__animated animate__fadeInDown">
      <q-toolbar>
        <q-btn flat dense round icon="menu" @click="leftDrawerOpen = !leftDrawerOpen" />
        <q-toolbar-title class="text-weight-bold">
          Bienvenido, {{ nombreUsuario }}
        </q-toolbar-title>
        <q-btn flat dense icon="logout" label="Cerrar sesión" color="negative" @click="cerrarSesion" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" :value="false" show-if-above bordered :breakpoint="0"
      class="bg-deep-purple-7 text-white animate__animated animate__fadeInLeft">
      <q-list>
        <q-item-label header class="text-grey-4">MENÚ</q-item-label>

        <q-item clickable to="/app/inicio" active-class="bg-white text-primary">
          <q-item-section avatar>
            <q-icon name="home" />
          </q-item-section>
          <q-item-section>Inicio</q-item-section>
        </q-item>

        <q-separator class="q-my-sm" color="white" />

        <!-- Lista de Casos - Visible para todos los roles -->
        <q-item :to="rol === 'ESTUDIANTE' ? '/app/estudiantes/lista-casos' : '/app/docentes/lista-casos'"
               active-class="bg-white text-primary">
          <q-item-section avatar>
            <q-icon name="list_alt" />
          </q-item-section>
          <q-item-section>Lista de Casos</q-item-section>
        </q-item>

        <!-- Sección para Estudiantes - Evaluaciones Pendientes -->
        <template v-if="rol === 'ESTUDIANTE'">
          <q-item clickable to="/app/estudiantes/evaluaciones-pendientes" active-class="bg-white text-primary">
            <q-item-section avatar>
              <q-icon name="assignment" />
            </q-item-section>
            <q-item-section>Evaluaciones Pendientes</q-item-section>
            <q-item-section side v-if="tieneEvaluacionesPendientes">
              <q-badge color="red" floating>{{ cantidadEvaluacionesPendientes }}</q-badge>
            </q-item-section>
          </q-item>
        </template>

        <q-separator class="q-my-sm" color="white" />

        <!-- Sección para Administradores -->
        <template v-if="rol === 'ADMINISTRADOR'">
          <q-expansion-item expand-separator icon="admin_panel_settings" label="Administración"
            header-class="text-white">
            <q-item clickable to="/app/admin/gestiones" active-class="bg-white text-primary">
              <q-item-section avatar>
                <q-icon name="calendar_month" />
              </q-item-section>
              <q-item-section>Gestiones Académicas</q-item-section>
            </q-item>

            <q-item clickable to="/app/admin/grupos-materia" active-class="bg-white text-primary">
              <q-item-section avatar>
                <q-icon name="group_work" />
              </q-item-section>
              <q-item-section>Grupos por Materia</q-item-section>
            </q-item>

            <q-item clickable to="/app/admin/asignacion-estudiantes" active-class="bg-white text-primary">
              <q-item-section avatar>
                <q-icon name="person_add" />
              </q-item-section>
              <q-item-section>Asignar Estudiantes</q-item-section>
            </q-item>

            <!-- Nuevo elemento del menú para Importar Usuarios -->
            <q-item clickable to="/app/admin/importar-usuarios" active-class="bg-white text-primary">
              <q-item-section avatar>
                <q-icon name="upload_file" />
              </q-item-section>
              <q-item-section>Importar Usuarios</q-item-section>
            </q-item>
          </q-expansion-item>

          <q-separator class="q-my-sm" color="white" />
        </template>

        <!-- Sección para Docentes -->
        <template v-if="rol === 'DOCENTE' || rol === 'ADMINISTRADOR'">
          <q-expansion-item expand-separator icon="school" label="Docentes" header-class="text-white">
            <q-item clickable to="/app/docentes/crear-caso" active-class="bg-white text-primary">
              <q-item-section avatar>
                <q-icon name="add_circle_outline" />
              </q-item-section>
              <q-item-section>Crear Caso</q-item-section>
            </q-item>

            <q-item clickable to="/app/docentes/programar-examen" active-class="bg-white text-primary">
              <q-item-section avatar>
                <q-icon name="event_note" />
              </q-item-section>
              <q-item-section>Programar Evaluación</q-item-section>
            </q-item>

            <!-- Nuevo elemento para ver evaluaciones creadas -->
            <q-item clickable to="/app/docentes/mis-evaluaciones" active-class="bg-white text-primary">
              <q-item-section avatar>
                <q-icon name="assessment" />
              </q-item-section>
              <q-item-section>Mis Evaluaciones</q-item-section>
            </q-item>
          </q-expansion-item>
        </template>
      </q-list>
    </q-drawer>

    <q-page-container class="bg-grey-1 animate__animated animate__fadeIn">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
import 'animate.css'

const $q = useQuasar()
const router = useRouter()
const leftDrawerOpen = ref(false)
const nombreUsuario = ref('')
const rol = ref('')
const tieneEvaluacionesPendientes = ref(false)
const cantidadEvaluacionesPendientes = ref(0)
const userData = ref(null)

onMounted(() => {
  try {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      router.push({ name: 'auth' })
      return
    }

    userData.value = JSON.parse(userStr)
    if (userData.value) {
      nombreUsuario.value = userData.value.name || ''
      rol.value = userData.value.role || ''

      // Si el rol es estudiante, verificar si tiene evaluaciones pendientes
      if (rol.value === 'ESTUDIANTE') {
        verificarEvaluacionesPendientes()
      }
    } else {
      $q.notify({
        message: 'Error al cargar información del usuario',
        color: 'negative'
      })
      router.push({ name: 'auth' })
    }
  } catch (error) {
    console.error('Error al cargar datos del usuario:', error)
    $q.notify({
      message: 'Sesión inválida. Por favor inicie sesión nuevamente.',
      color: 'negative',
      position: 'top'
    })
    cerrarSesion()
  }

  // Asegura que el menú esté cerrado al montar el componente
  leftDrawerOpen.value = false
})

function verificarEvaluacionesPendientes() {
  // Solo hacer la petición si el usuario está autenticado y es estudiante
  const token = localStorage.getItem('token')
  if (!token) return

  api.get('/evaluaciones/pendientes')
    .then(response => {
      if (response.data.evaluaciones && response.data.evaluaciones.length > 0) {
        tieneEvaluacionesPendientes.value = true
        cantidadEvaluacionesPendientes.value = response.data.evaluaciones.length
      } else {
        tieneEvaluacionesPendientes.value = false
        cantidadEvaluacionesPendientes.value = 0
      }
    })
    .catch(error => {
      console.error('Error al verificar evaluaciones pendientes:', error)
      // No mostrar notificación para no molestar al usuario con errores no críticos
    })
}

function cerrarSesion() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('estudiante_id')
  localStorage.removeItem('docente_id')
  router.push({ name: 'auth' })
}
</script>

<style scoped>
.main-layout {
  font-family: 'Roboto', sans-serif;
}

.q-drawer__content {
  transition: all 0.3s ease-in-out;
}

.q-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transition: background-color 0.2s;
}

/* Clase aplicada a los elementos activos del menú */
.bg-white.text-primary {
  background: #fff !important;
  color: var(--q-primary) !important;
  font-weight: 500;
}
</style>
