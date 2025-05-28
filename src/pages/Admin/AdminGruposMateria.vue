<template>
  <div class="q-pa-md">
    <!-- Encabezado con información de gestión mejorada -->
    <div class="text-h4 text-deep-purple-10 q-mb-lg text-center">
      Administración de Grupos por Materia
      <div class="gestion-badge q-mt-sm">
        <q-badge color="deep-purple-6" class="text-bold text-white q-py-sm q-px-md">
          <q-icon name="calendar_today" size="xs" class="q-mr-xs" />
          Gestión Activa: {{ gestionActiva ? gestionActiva.nombre : 'Cargando...' }}
        </q-badge>
      </div>
    </div>

    <q-card class="q-mb-lg shadow-3">
      <q-card-section class="bg-deep-purple-2">
        <div class="text-h6 text-deep-purple-10">Seleccionar Materia</div>
      </q-card-section>
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-md-6 col-xs-12">
            <q-select v-model="selectedMateria" :options="materias" option-label="nombre" label="Materia" outlined
              map-options class="q-mb-md" :loading="loadingMaterias" @update:model-value="loadGruposByMateria" />
          </div>
          <div class="col-md-6 col-xs-12">
            <q-btn color="deep-purple-9" icon="add_circle" label="Añadir Grupo" class="full-width"
              :disable="!selectedMateria" @click="abrirDialogAgregarGrupo" />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card v-if="selectedMateria" class="shadow-3">
      <q-card-section class="bg-deep-purple-2">
        <div class="text-h6 text-deep-purple-10 row items-center justify-between">
          <div>
            Grupos de {{ selectedMateria?.nombre }}
            <q-chip color="deep-purple-6" text-color="white" class="q-ml-sm">
              {{ grupos.length }} grupos
            </q-chip>
          </div>
          <q-btn v-if="grupos.length > 0" dense flat round color="deep-purple-9" icon="refresh"
            @click="loadGruposByMateria" />
        </div>
      </q-card-section>
      <q-card-section>
        <div v-if="loadingGrupos" class="text-center q-pa-md">
          <q-spinner color="deep-purple" size="3em" />
          <div class="q-mt-sm">Cargando grupos...</div>
        </div>
        <div v-else-if="grupos.length === 0" class="text-center q-pa-lg">
          <q-icon name="groups" size="3em" color="grey-7" />
          <div class="text-h6 text-grey-7 q-mt-sm">No hay grupos para esta materia</div>
          <q-btn color="deep-purple-9" class="q-mt-md" label="Crear primer grupo" icon="add_circle"
            @click="abrirDialogAgregarGrupo" />
        </div>
        <q-table v-else :rows="grupos" :columns="columnsGrupos" row-key="id" separator="cell"
          :pagination="{ rowsPerPage: 10 }">
          <template v-slot:top>
            <div class="q-table__title">Total: {{ grupos.length }} grupos</div>
            <q-space />
            <q-btn color="deep-purple-9" icon="add_circle" label="Añadir Grupo" dense
              @click="abrirDialogAgregarGrupo" />
          </template>

          <template v-slot:body-cell-nombre="props">
            <q-td :props="props">
              {{ props.value }}
            </q-td>
          </template>

          <template v-slot:body-cell-docente="props">
            <q-td :props="props">
              <div class="text-center">
                {{ getDocenteNombre(props.row.docente_id) }}
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-estudiantes="props">
            <q-td :props="props" class="text-center">
              <div class="row items-center justify-center">
                <div>{{ props.value }}</div>
                <q-btn flat round size="sm" color="blue-7" icon="people" class="q-ml-sm"
                  @click="verEstudiantes(props.row.id)" />
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-acciones="props">
            <q-td :props="props" class="text-center">
              <div class="row justify-center">
                <q-btn flat round color="amber-8" icon="edit" class="q-mr-sm" @click="editarGrupo(props.row)" />
                <q-btn flat round color="red-7" icon="delete" @click="confirmarEliminarGrupo(props.row.id)" />
              </div>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Dialog para agregar un grupo (simplificado) -->
    <q-dialog v-model="mostrarDialogAgregarGrupo" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="bg-deep-purple-4 text-white">
          <div class="text-h6">Agregar Grupo</div>
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-input v-model="nuevoGrupo.nombre" label="Nombre del grupo" outlined dense class="q-mb-md"
            :rules="[val => !!val || 'El nombre es requerido']" />

          <q-select ref="docenteSelect" v-model="nuevoGrupo.docente_id" :options="docentesFiltrados" option-label="label"
            option-value="id" label="Docente asignado (requerido)" outlined dense emit-value map-options use-input
            hide-selected fill-input input-debounce="300" @filter="filterDocentes"
            :rules="[val => !!val || 'Debe seleccionar un docente']">
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">No hay docentes disponibles</q-item-section>
              </q-item>
            </template>
            <template v-slot:selected>
              <template v-if="nuevoGrupo.docente_id">
                {{ getDocenteById(nuevoGrupo.docente_id)?.label || '' }}
              </template>
            </template>
          </q-select>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="negative" v-close-popup />
          <q-btn flat label="Crear" color="deep-purple-9" @click="crearGrupoIndividual" :loading="creandoGrupo" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog para editar un grupo -->
    <q-dialog v-model="mostrarDialogEditarGrupo" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="bg-amber-8 text-white">
          <div class="text-h6">Editar Grupo</div>
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-input v-model="grupoEditando.nombre" label="Nombre del grupo" outlined dense class="q-mb-md"
            :rules="[val => !!val || 'El nombre es requerido']" />

          <q-select v-model="grupoEditando.docente_id" :options="docentesFiltrados" option-label="label" option-value="id"
            label="Docente asignado (requerido)" outlined dense emit-value map-options use-input hide-selected
            fill-input input-debounce="300" @filter="filterDocentes"
            :rules="[val => !!val || 'Debe seleccionar un docente']">
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">No hay docentes disponibles</q-item-section>
              </q-item>
            </template>
            <template v-slot:selected>
              <template v-if="grupoEditando.docente_id">
                {{ getDocenteById(grupoEditando.docente_id)?.label || '' }}
              </template>
            </template>
          </q-select>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="negative" v-close-popup />
          <q-btn flat label="Guardar" color="amber-8" @click="guardarEdicionGrupo" :loading="editandoGrupo" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog confirmar eliminación -->
    <q-dialog v-model="mostrarConfirmacionEliminar" persistent>
      <q-card>
        <q-card-section class="bg-red-7 text-white">
          <div class="text-h6">Confirmar Eliminación</div>
        </q-card-section>
        <q-card-section class="q-pt-md">
          ¿Está seguro que desea eliminar este grupo? Esta acción no se puede deshacer.
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn flat label="Eliminar" color="negative" @click="eliminarGrupo" :loading="eliminandoGrupo" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'

const $q = useQuasar()

// Variables reactivas
const loadingMaterias = ref(true)
const loadingGrupos = ref(false)
const materias = ref([])
const selectedMateria = ref(null)
const grupos = ref([])
const docentes = ref([])
const docentesFiltrados = ref([])

// Variables para agregar grupo
const mostrarDialogAgregarGrupo = ref(false)
const creandoGrupo = ref(false)
const docenteSelect = ref(null)
const nuevoGrupo = ref({
  nombre: '',
  docente_id: null
})

// Variables para editar grupo
const mostrarDialogEditarGrupo = ref(false)
const editandoGrupo = ref(false)
const grupoEditando = ref({
  id: null,
  nombre: '',
  docente_id: null
})

// Variables para eliminar grupo
const mostrarConfirmacionEliminar = ref(false)
const grupoAEliminar = ref(null)
const eliminandoGrupo = ref(false)

// Variable para gestión
const gestionActiva = ref(null)

// Columnas para la tabla de grupos
const columnsGrupos = [
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' },
  { name: 'docente', label: 'Docente Asignado', field: 'docente_id', align: 'center' },
  { name: 'estudiantes', label: 'Estudiantes', field: row => row.estudiantes_count || 0, align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
]

// Cargar datos al montar el componente
onMounted(async () => {
  try {
    await Promise.all([
      cargarGestionActiva(),
      cargarMaterias(),
      cargarDocentes()
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

// Función para abrir el diálogo de agregar grupo
function abrirDialogAgregarGrupo() {
  // Limpiar formulario
  nuevoGrupo.value = {
    nombre: '',
    docente_id: null
  }
  // Resetear los docentes filtrados
  docentesFiltrados.value = [...docentes.value]
  mostrarDialogAgregarGrupo.value = true
}

// Función para cargar la gestión activa
async function cargarGestionActiva() {
  try {
    const response = await api.get('/gestiones/activa')
    gestionActiva.value = response.data
  } catch (error) {
    console.error('Error al cargar gestión activa:', error)
    $q.notify({
      color: 'negative',
      message: 'Error al cargar información de la gestión activa',
      icon: 'error'
    })
  }
}

// Función para cargar materias
async function cargarMaterias() {
  loadingMaterias.value = true
  try {
    const response = await api.get('/materias')
    materias.value = response.data
  } catch (error) {
    console.error('Error al cargar materias:', error)
    $q.notify({
      color: 'negative',
      message: 'Error al cargar materias',
      icon: 'error'
    })
  } finally {
    loadingMaterias.value = false
  }
}

// Función para cargar docentes
async function cargarDocentes() {
  try {
    console.log('Cargando docentes...')
    const response = await api.get('/docentes')
    console.log('Respuesta docentes:', response.data)

    // Formatear docentes con label para el q-select
    docentes.value = response.data.map(docente => ({
      ...docente,
      id: docente.id,
      label: `${docente.nombre_completo || `${docente.nombres} ${docente.apellidos}`} (${docente.ci || docente.user_name})`
    }))

    docentesFiltrados.value = [...docentes.value]
  } catch (error) {
    console.error('Error al cargar docentes:', error)
    $q.notify({
      color: 'negative',
      message: 'Error al cargar docentes: ' + (error.response?.data?.message || error.message),
      icon: 'error'
    })
  }
}

// Filtrar docentes según texto de búsqueda
function filterDocentes(val, update) {
  if (val === '') {
    update(() => {
      docentesFiltrados.value = docentes.value
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    docentesFiltrados.value = docentes.value.filter(v =>
      // Buscar en el label completo
      (v.label && v.label.toLowerCase().indexOf(needle) > -1) ||
      // Buscar en CI/usuario
      (v.user_name && v.user_name.toLowerCase().indexOf(needle) > -1) ||
      // Buscar en nombre completo
      (v.nombre_completo && v.nombre_completo.toLowerCase().indexOf(needle) > -1) ||
      // También buscar en nombres y apellidos por separado
      (v.nombres && v.nombres.toLowerCase().indexOf(needle) > -1) ||
      (v.apellidos && v.apellidos.toLowerCase().indexOf(needle) > -1) ||
      // Añadir búsqueda por CI (número de documento)
      (v.ci && v.ci.toString().indexOf(needle) > -1)
    )
  })
}

// Obtener label de docente por ID
function getDocenteById(id) {
  if (!id) return null
  return docentes.value.find(d => d.id === parseInt(id))
}

// Obtener nombre del docente para mostrar en la tabla
function getDocenteNombre(docenteId) {
  if (!docenteId) return 'Sin asignar'

  const docente = docentes.value.find(d => d.id === parseInt(docenteId))
  if (!docente) return 'Docente no encontrado'

  return docente.label || docente.nombre_completo || `${docente.nombres} ${docente.apellidos}`
}

// Función para cargar grupos por materia
async function loadGruposByMateria() {
  if (!selectedMateria.value) return

  loadingGrupos.value = true
  try {
    const response = await api.get(`/materias/${selectedMateria.value.id}/grupos`, {
      params: { gestion_id: gestionActiva.value?.id }
    })
    grupos.value = response.data

    // Asegurarnos de que cada grupo tenga su docente_id correctamente
    grupos.value.forEach(grupo => {
      if (grupo.docente) {
        grupo.docente_id = grupo.docente.id
      }
    })

    console.log('Grupos cargados:', grupos.value)
  } catch (error) {
    console.error('Error al cargar grupos:', error)
    $q.notify({
      color: 'negative',
      message: 'Error al cargar grupos de la materia',
      icon: 'error'
    })
    grupos.value = []
  } finally {
    loadingGrupos.value = false
  }
}


// Función para crear un grupo individual
async function crearGrupoIndividual() {
  if (!selectedMateria.value || !nuevoGrupo.value.nombre) {
    $q.notify({
      color: 'warning',
      message: 'Debe especificar un nombre para el grupo',
      icon: 'warning'
    })
    return
  }

  if (!nuevoGrupo.value.docente_id) {
    $q.notify({
      color: 'warning',
      message: 'Debe seleccionar un docente',
      icon: 'warning'
    })
    return
  }

  creandoGrupo.value = true
  try {
    console.log('DATOS DEL FORM:')
    console.log('Nombre grupo:', nuevoGrupo.value.nombre)
    console.log('Docente ID (antes de procesar):', nuevoGrupo.value.docente_id)
    console.log('Tipo de docente_id:', typeof nuevoGrupo.value.docente_id)

    // Asegurarnos de que docente_id sea un número
    const docenteId = parseInt(nuevoGrupo.value.docente_id)
    console.log('Docente ID (después de parseInt):', docenteId)

    const payload = {
      materia_id: selectedMateria.value.id,
      nombre: nuevoGrupo.value.nombre,
      cantidad: 1,
      docente_id: docenteId
    }

    console.log('DATOS ENVIADOS AL BACKEND:', payload)

    const response = await api.post('/grupos/generar', payload)

    console.log('Respuesta del servidor:', response.data)

    $q.notify({
      color: 'positive',
      message: 'Grupo creado correctamente',
      icon: 'check_circle'
    })

    mostrarDialogAgregarGrupo.value = false
    // Limpiar formulario
    nuevoGrupo.value = {
      nombre: '',
      docente_id: null
    }
    await loadGruposByMateria()
  } catch (error) {
    console.error('Error al crear grupo:', error)
    const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message
    $q.notify({
      color: 'negative',
      message: 'Error al crear grupo: ' + errorMsg,
      icon: 'error'
    })
  } finally {
    creandoGrupo.value = false
  }
}

// Función para iniciar la edición de un grupo
function editarGrupo(grupo) {
  grupoEditando.value = {
    id: grupo.id,
    nombre: grupo.nombre,
    docente_id: grupo.docente_id
  }
  // Resetear los docentes filtrados
  docentesFiltrados.value = [...docentes.value]
  mostrarDialogEditarGrupo.value = true
}

// Función para guardar la edición de un grupo
async function guardarEdicionGrupo() {
  if (!grupoEditando.value.nombre) {
    $q.notify({
      color: 'warning',
      message: 'Debe especificar un nombre para el grupo',
      icon: 'warning'
    })
    return
  }

  if (!grupoEditando.value.docente_id) {
    $q.notify({
      color: 'warning',
      message: 'Debe seleccionar un docente',
      icon: 'warning'
    })
    return
  }

  editandoGrupo.value = true
  try {
    console.log('DATOS DE EDICIÓN:')
    console.log('ID grupo:', grupoEditando.value.id)
    console.log('Nombre grupo:', grupoEditando.value.nombre)
    console.log('Docente ID:', grupoEditando.value.docente_id)

    // Primero actualizamos el nombre del grupo (si hay un endpoint para ello)
    // Este endpoint es hipotético, necesitarías implementarlo en el backend
    await api.put(`/grupos/${grupoEditando.value.id}`, {
      nombre: grupoEditando.value.nombre
    })

    // Luego asignamos el docente
    await api.put(`/grupos/${grupoEditando.value.id}/docente`, {
      docente_id: parseInt(grupoEditando.value.docente_id)
    })

    $q.notify({
      color: 'positive',
      message: 'Grupo actualizado correctamente',
      icon: 'check_circle'
    })

    mostrarDialogEditarGrupo.value = false
    await loadGruposByMateria()
  } catch (error) {
    console.error('Error al actualizar grupo:', error)
    const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message
    $q.notify({
      color: 'negative',
      message: 'Error al actualizar grupo: ' + errorMsg,
      icon: 'error'
    })
  } finally {
    editandoGrupo.value = false
  }
}

// Funciones para eliminar grupo
function confirmarEliminarGrupo(grupoId) {
  grupoAEliminar.value = grupoId
  mostrarConfirmacionEliminar.value = true
}

async function eliminarGrupo() {
  if (!grupoAEliminar.value) return

  eliminandoGrupo.value = true
  try {
    await api.delete(`/grupos/${grupoAEliminar.value}`)

    $q.notify({
      color: 'positive',
      message: 'Grupo eliminado correctamente',
      icon: 'check_circle'
    })

    mostrarConfirmacionEliminar.value = false
    await loadGruposByMateria()
  } catch (error) {
    console.error('Error al eliminar grupo:', error)
    $q.notify({
      color: 'negative',
      message: error.response?.data?.message || 'Error al eliminar grupo',
      icon: 'error'
    })
  } finally {
    eliminandoGrupo.value = false
  }
}
</script>

<style scoped>
.q-table th {
  font-weight: bold;
  background-color: #f5f5f5;
}

.gestion-badge {
  display: flex;
  justify-content: center;
  margin-top: 8px;
}

.gestion-badge .q-badge {
  font-size: 0.9rem;
  border-radius: 12px;
}
</style>
