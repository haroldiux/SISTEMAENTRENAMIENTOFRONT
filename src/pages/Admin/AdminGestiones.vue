<template>
  <div class="q-pa-md">
    <div class="text-h4 text-deep-purple-10 q-mb-lg text-center">
      Administración de Gestiones Académicas
    </div>

    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-md-8 col-xs-12">
        <q-card class="shadow-3">
          <q-card-section class="bg-deep-purple-2">
            <div class="text-h6 text-deep-purple-10">Crear Nueva Gestión</div>
          </q-card-section>
          <q-card-section>
            <q-form @submit="crearGestion" class="q-gutter-md">
              <div class="row q-col-gutter-md">
                <div class="col-md-6 col-xs-12">
                  <q-input v-model="nuevaGestion.nombre" label="Nombre de la Gestión" outlined
                    :rules="[val => !!val || 'El nombre es obligatorio']" />
                </div>
                <div class="col-md-6 col-xs-12">
                  <q-input v-model.number="nuevaGestion.anio" type="number" label="Año" outlined :rules="[
                    val => !!val || 'El año es obligatorio',
                    val => val >= 2020 || 'El año debe ser 2020 o posterior'
                  ]" />
                </div>
              </div>

              <div class="row justify-end">
                <q-btn type="submit" color="deep-purple-9" icon="add_circle" label="Crear Gestión"
                  :loading="creandoGestion" />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-md-4 col-xs-12">
        <q-card class="bg-light-green-1 shadow-3">
          <q-card-section class="bg-light-green-5">
            <div class="text-h6 text-white">Gestión Activa</div>
          </q-card-section>
          <q-card-section>
            <div v-if="loadingGestionActiva" class="text-center q-pa-md">
              <q-spinner color="deep-purple" size="2em" />
              <div class="q-mt-sm">Cargando...</div>
            </div>
            <div v-else-if="!gestionActiva" class="text-center q-pa-md">
              <q-icon name="info" size="2em" color="grey-7" />
              <div class="text-subtitle1 q-mt-sm">No hay gestión activa</div>
            </div>
            <div v-else>
              <div class="text-h5 text-center text-deep-purple-9">{{ gestionActiva.nombre }}</div>
              <q-list dense>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="calendar_today" color="deep-purple-7" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Año: {{ gestionActiva.anio }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-card class="shadow-3">
      <q-card-section class="bg-deep-purple-2">
        <div class="text-h6 text-deep-purple-10">Lista de Gestiones</div>
      </q-card-section>
      <q-card-section>
        <div class="q-mb-md">
          <q-input v-model="busqueda" outlined dense placeholder="Buscar por nombre o año..." clearable>
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>

        <div v-if="loadingGestiones" class="text-center q-pa-md">
          <q-spinner color="deep-purple" size="3em" />
          <div class="q-mt-sm">Cargando gestiones...</div>
        </div>
        <div v-else-if="gestionesFiltradas.length === 0" class="text-center q-pa-lg">
          <q-icon name="sentiment_dissatisfied" size="3em" color="grey-7" />
          <div class="text-h6 text-grey-7 q-mt-sm">
            {{ gestiones.length === 0 ? 'No hay gestiones registradas' : 'No se encontraron resultados' }}
          </div>
        </div>
        <q-table v-else :rows="gestionesFiltradas" :columns="columnsGestiones" row-key="id" separator="cell"
          :pagination="{ rowsPerPage: 10 }">
          <template v-slot:body-cell-estado="props">
            <q-td :props="props" class="text-center">
              <q-badge :color="Boolean(props.row.estado) ? 'positive' : 'grey'"
                :label="Boolean(props.row.estado) ? 'Activa' : 'Inactiva'" />
            </q-td>
          </template>
          <template v-slot:body-cell-acciones="props">
            <q-td :props="props" class="text-center">
              <q-btn flat round color="amber-7" icon="edit" @click="abrirEdicion(props.row)">
                <q-tooltip>Editar Gestión</q-tooltip>
              </q-btn>
              <q-btn flat round :color="Boolean(props.row.estado) ? 'grey' : 'green'"
                :icon="Boolean(props.row.estado) ? 'toggle_on' : 'toggle_off'" :disable="Boolean(props.row.estado)"
                @click="cambiarEstadoGestion(props.row.id, true)">
                <q-tooltip>{{ Boolean(props.row.estado) ? 'Gestión Activa' : 'Activar Gestión' }}</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Dialog para editar gestión -->
    <q-dialog v-model="mostrarDialogoEdicion" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="bg-deep-purple-4 text-white">
          <div class="text-h6">Editar Gestión</div>
        </q-card-section>
        <q-card-section>
          <q-form @submit="actualizarGestion" class="q-gutter-md">
            <q-input v-model="gestionEditando.nombre" label="Nombre de la Gestión" outlined
              :rules="[val => !!val || 'El nombre es obligatorio']" />

            <q-input v-model.number="gestionEditando.anio" type="number" label="Año" outlined :rules="[
              val => !!val || 'El año es obligatorio',
              val => val >= 2020 || 'El año debe ser 2020 o posterior'
            ]" />
          </q-form>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="negative" v-close-popup />
          <q-btn flat label="Guardar" color="deep-purple-9" @click="actualizarGestion" :loading="editandoGestion" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'  // Importar la instancia configurada

const $q = useQuasar()

// Variables reactivas
const loadingGestiones = ref(true)
const loadingGestionActiva = ref(true)
const gestiones = ref([])
const gestionActiva = ref(null)
const nuevaGestion = ref({
  nombre: '',
  anio: new Date().getFullYear()
})
const creandoGestion = ref(false)
const busqueda = ref('')

// Variables para edición
const mostrarDialogoEdicion = ref(false)
const gestionEditando = ref({
  id: null,
  nombre: '',
  anio: 0
})
const editandoGestion = ref(false)

// Columnas para la tabla de gestiones
const columnsGestiones = [
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
  { name: 'anio', label: 'Año', field: 'anio', align: 'center', sortable: true },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center', sortable: true },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
]

// Gestiones filtradas según búsqueda
const gestionesFiltradas = computed(() => {
  if (!busqueda.value.trim()) return gestiones.value

  const termino = busqueda.value.toLowerCase().trim()

  return gestiones.value.filter(gestion =>
    gestion.nombre.toLowerCase().includes(termino) ||
    String(gestion.anio).includes(termino)
  )
})

// Cargar datos al montar el componente
onMounted(async () => {
  try {
    await Promise.all([
      cargarGestiones(),
      cargarGestionActiva()
    ])
  } catch (error) {
    console.error('Error al inicializar:', error)
    $q.notify({
      color: 'negative',
      message: 'Error al cargar datos iniciales',
      icon: 'error'
    })
  }
})

// Función para cargar gestiones
async function cargarGestiones() {
  loadingGestiones.value = true
  try {
    const response = await api.get('/gestiones')  // Usar api en lugar de axios directo
    gestiones.value = response.data
  } catch (error) {
    console.error('Error al cargar gestiones:', error)
    $q.notify({
      color: 'negative',
      message: 'Error al cargar gestiones',
      icon: 'error'
    })
  } finally {
    loadingGestiones.value = false
  }
}

// Función para cargar la gestión activa
async function cargarGestionActiva() {
  loadingGestionActiva.value = true
  try {
    const response = await api.get('/gestiones/activa')  // Usar api en lugar de axios directo
    gestionActiva.value = response.data
  } catch (error) {
    console.error('Error al cargar gestión activa:', error)
    $q.notify({
      color: 'negative',
      message: 'Error al cargar gestión activa',
      icon: 'error'
    })
  } finally {
    loadingGestionActiva.value = false
  }
}

// Función para crear gestión
async function crearGestion() {
  creandoGestion.value = true
  try {
    await api.post('/gestiones', nuevaGestion.value)  // Usar api en lugar de axios directo

    $q.notify({
      color: 'positive',
      message: 'Gestión creada correctamente',
      icon: 'check_circle'
    })

    // Reiniciar formulario
    nuevaGestion.value = {
      nombre: '',
      anio: new Date().getFullYear()
    }

    // Recargar datos
    await Promise.all([
      cargarGestiones(),
      cargarGestionActiva()
    ])
  } catch (error) {
    console.error('Error al crear gestión:', error)
    $q.notify({
      color: 'negative',
      message: error.response?.data?.errors ? Object.values(error.response.data.errors).flat().join(', ') : 'Error al crear gestión',
      icon: 'error'
    })
  } finally {
    creandoGestion.value = false
  }
}

// Función para cambiar estado de gestión
async function cambiarEstadoGestion(gestionId, nuevoEstado) {
  try {
    await api.put(`/gestiones/${gestionId}/estado`, {  // Usar api en lugar de axios directo
      estado: nuevoEstado
    })

    $q.notify({
      color: 'positive',
      message: nuevoEstado ? 'Gestión activada correctamente' : 'Gestión desactivada correctamente',
      icon: 'check_circle'
    })

    // Recargar datos
    await Promise.all([
      cargarGestiones(),
      cargarGestionActiva()
    ])
  } catch (error) {
    console.error('Error al cambiar estado de gestión:', error)
    $q.notify({
      color: 'negative',
      message: error.response?.data?.message || 'Error al cambiar estado de gestión',
      icon: 'error'
    })
  }
}

// Función para abrir diálogo de edición
function abrirEdicion(gestion) {
  gestionEditando.value = {
    id: gestion.id,
    nombre: gestion.nombre,
    anio: gestion.anio
  }
  mostrarDialogoEdicion.value = true
}

// Función para actualizar gestión
async function actualizarGestion() {
  if (!gestionEditando.value.id) return

  editandoGestion.value = true
  try {
    await api.put(`/gestiones/${gestionEditando.value.id}`, {
      nombre: gestionEditando.value.nombre,
      anio: gestionEditando.value.anio
    })

    $q.notify({
      color: 'positive',
      message: 'Gestión actualizada correctamente',
      icon: 'check_circle'
    })

    mostrarDialogoEdicion.value = false
    await cargarGestiones()

    // Si la gestión editada es la activa, recargar también la activa
    if (gestionActiva.value && gestionActiva.value.id === gestionEditando.value.id) {
      await cargarGestionActiva()
    }
  } catch (error) {
    console.error('Error al actualizar gestión:', error)
    $q.notify({
      color: 'negative',
      message: error.response?.data?.errors ? Object.values(error.response.data.errors).flat().join(', ') : 'Error al actualizar gestión',
      icon: 'error'
    })
  } finally {
    editandoGestion.value = false
  }
}
</script>

<style scoped>
.q-table th {
  font-weight: bold;
  background-color: #f5f5f5;
}
</style>
