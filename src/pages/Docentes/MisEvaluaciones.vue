<template>
  <q-page padding>
    <!-- Encabezado -->
    <div class="row justify-between items-center q-mb-md">
      <h1 class="text-h4 q-my-sm text-deep-purple-9">Mis Evaluaciones</h1>
      <div>

      </div>
    </div>

    <!-- Tarjeta principal con tabla de evaluaciones -->
    <q-card class="animate__animated animate__fadeIn">
      <q-card-section>
        <div class="row items-center justify-between q-mb-md">
          <q-input v-model="busqueda" outlined dense placeholder="Buscar por título o materia" class="col-12 col-sm-4">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
          <div class="col-12 col-sm-auto q-mt-sm q-mt-sm-none">
            <q-btn icon="picture_as_pdf" label="Exportar PDF" color="negative" class="q-mr-sm" @click="exportarListaPDF"
              :loading="exportandoPDF" />
            <q-btn icon="table_view" label="Exportar Excel" color="positive" @click="exportarListaExcel"
              :loading="exportandoExcel" />
          </div>
        </div>

        <q-table :rows="evaluacionesFiltradas" :columns="columns" row-key="id" :pagination="pagination"
          :loading="cargando" :filter="busqueda" binary-state-sort>
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="titulo" :props="props">
                {{ props.row.titulo }}
              </q-td>
              <q-td key="materia" :props="props">
                {{ props.row.materia?.nombre || 'N/A' }}
              </q-td>
              <q-td key="grupo" :props="props">
                {{ props.row.grupo?.nombre || 'N/A' }}
              </q-td>
              <q-td key="fecha_inicio" :props="props">
                {{ formatearFecha(props.row.fecha_inicio) }}
              </q-td>
              <q-td key="fecha_fin" :props="props">
                {{ formatearFecha(props.row.fecha_fin) }}
              </q-td>
              <q-td key="estado" :props="props">
                <q-badge :color="getColorEstado(props.row)">
                  {{ getEstadoTexto(props.row) }}
                </q-badge>
              </q-td>
              <q-td key="acciones" :props="props">
                <div class="q-gutter-xs">
                  <q-btn size="sm" round color="orange" icon="assignment" @click="verCalificaciones(props.row)">
                    <q-tooltip>Ver calificaciones</q-tooltip>
                  </q-btn>
                  <q-btn size="sm" round color="indigo" icon="print" @click="exportarEvaluacionPDF(props.row)">
                    <q-tooltip>Exportar a PDF</q-tooltip>
                  </q-btn>
                  <q-btn size="sm" round color="green" icon="table_chart" @click="exportarEvaluacionExcel(props.row)">
                    <q-tooltip>Exportar a Excel</q-tooltip>
                  </q-btn>
                </div>
              </q-td>
            </q-tr>
          </template>

          <template v-slot:loading>
            <q-inner-loading showing color="primary">
              <q-spinner size="50px" color="primary" />
            </q-inner-loading>
          </template>

          <template v-slot:no-data>
            <div class="full-width row flex-center q-pa-md text-negative">
              <q-icon name="sentiment_dissatisfied" size="2rem" />
              <span class="q-ml-sm">No se encontraron evaluaciones</span>
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Modal para ver calificaciones -->
    <q-dialog v-model="mostrarCalificaciones" persistent>
      <q-card style="min-width: 700px; max-width: 90vw">
        <q-card-section class="row items-center bg-deep-purple-9 text-white">
          <div class="text-h6">Calificaciones - {{ evaluacionSeleccionada.titulo }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section style="max-height: 70vh" class="scroll">
          <div class="q-mb-md">
            <q-btn icon="picture_as_pdf" label="Exportar Calificaciones PDF" color="negative" class="q-mr-sm"
              @click="exportarCalificacionesPDF" size="sm" />
            <q-btn icon="table_view" label="Exportar Calificaciones Excel" color="positive"
              @click="exportarCalificacionesExcel" size="sm" />
          </div>

          <q-table :rows="calificacionesEstudiantes" :columns="columnsCalificaciones" row-key="id"
            :loading="cargandoCalificaciones" :pagination="{ rowsPerPage: 0 }">
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="nombres" :props="props">
                  {{ props.row.estudiante?.nombres || 'N/A' }}
                </q-td>
                <q-td key="apellidos" :props="props">
                  {{ props.row.estudiante ? `${props.row.estudiante.apellido1 || ''} ${props.row.estudiante.apellido2 ||
                    ''}` : 'N/A' }}
                </q-td>
                <q-td key="caso" :props="props">
                  {{ getCasoTitulo(props.row) }}
                </q-td>
                <q-td key="puntaje" :props="props">
                  <q-badge :color="getColorPuntaje(props.row.puntaje || 0)">
                    {{ props.row.puntaje || 0 }}
                  </q-badge>
                </q-td>
                <q-td key="completado" :props="props">
                  <q-badge :color="props.row.completado ? 'positive' : (props.row.intentada ? 'warning' : 'negative')">
                    {{ props.row.completado ? 'Completado' : (props.row.intentada ? 'En progreso' : 'No iniciado') }}
                  </q-badge>
                </q-td>
                <q-td key="fecha_intento" :props="props">
                  {{ props.row.fecha_intento ? formatearFechaHora(props.row.fecha_intento) : 'N/A' }}
                </q-td>
              </q-tr>
            </template>

            <template v-slot:loading>
              <q-inner-loading showing color="primary">
                <q-spinner size="50px" color="primary" />
              </q-inner-loading>
            </template>

            <template v-slot:no-data>
              <div class="full-width row flex-center q-pa-md text-negative">
                <q-icon name="sentiment_dissatisfied" size="2rem" />
                <span class="q-ml-sm">No hay estudiantes asignados a esta evaluación</span>
              </div>
            </template>
          </q-table>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import 'animate.css'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

const $q = useQuasar()
const cargando = ref(true)
const evaluaciones = ref([])
const busqueda = ref('')
const pagination = ref({
  rowsPerPage: 10
})
const gestiones = ref([])
const gestionSeleccionada = ref(null)
const mostrarCalificaciones = ref(false)
const evaluacionSeleccionada = ref({})
const calificacionesEstudiantes = ref([])
const cargandoCalificaciones = ref(false)
const exportandoPDF = ref(false)
const exportandoExcel = ref(false)

// Definición de columnas para la tabla principal
const columns = [
  {
    name: 'titulo',
    required: true,
    label: 'Título',
    align: 'left',
    field: row => row.titulo || 'Sin título',
    sortable: true
  },
  {
    name: 'materia',
    required: true,
    label: 'Materia',
    align: 'left',
    field: row => row.materia?.nombre || 'N/A',
    sortable: true
  },
  {
    name: 'grupo',
    label: 'Grupo',
    align: 'left',
    field: row => row.grupo?.nombre || 'N/A',
    sortable: true
  },
  {
    name: 'fecha_inicio',
    label: 'Fecha Inicio',
    align: 'left',
    field: 'fecha_inicio',
    format: val => formatearFecha(val),
    sortable: true
  },
  {
    name: 'fecha_fin',
    label: 'Fecha Fin',
    align: 'left',
    field: 'fecha_fin',
    format: val => formatearFecha(val),
    sortable: true
  },
  {
    name: 'estado',
    label: 'Estado',
    align: 'center',
    field: getEstadoTexto,
    sortable: true
  },
  {
    name: 'acciones',
    label: 'Acciones',
    align: 'center',
    field: 'id'
  }
]

// Definición de columnas para la tabla de calificaciones
const columnsCalificaciones = [
  {
    name: 'nombres',
    required: true,
    label: 'Nombres',
    align: 'left',
    field: row => row.estudiante?.nombres || 'N/A',
    sortable: true
  },
  {
    name: 'apellidos',
    required: true,
    label: 'Apellidos',
    align: 'left',
    field: row => row.estudiante ? `${row.estudiante.apellido1 || ''} ${row.estudiante.apellido2 || ''}` : 'N/A',
    sortable: true
  },
  {
    name: 'caso',
    label: 'Caso Asignado',
    align: 'left',
    field: row => getCasoTitulo(row),
    sortable: true
  },
  {
    name: 'puntaje',
    label: 'Puntaje',
    align: 'center',
    field: 'puntaje',
    sortable: true
  },
  {
    name: 'completado',
    label: 'Estado',
    align: 'center',
    field: row => row.completado ? 'Completado' : (row.intentada ? 'En progreso' : 'No iniciado'),
    sortable: true
  },
  {
    name: 'fecha_intento',
    label: 'Fecha Intento',
    align: 'left',
    field: 'fecha_intento',
    format: val => val ? formatearFechaHora(val) : 'N/A',
    sortable: true,
    visible: false // Hacemos que esta columna no sea visible ya que mencionaste que no es relevante
  }
]

// Computed para opciones de gestión
const gestionesOptions = computed(() => {
  return gestiones.value.map(g => ({
    id: g.id,
    nombre: `${g.nombre} (${g.anio})`
  }))
})

// Computed para filtrar evaluaciones por gestión seleccionada
const evaluacionesFiltradas = computed(() => {
  if (!gestionSeleccionada.value) return evaluaciones.value

  return evaluaciones.value.filter(g => g.gestion_id === gestionSeleccionada.value.id)
})

// Cargar datos al montar el componente
onMounted(async () => {
  await cargarGestiones()
  await cargarEvaluaciones()
})

// Función para cargar gestiones académicas
async function cargarGestiones() {
  try {
    const response = await api.get('/gestiones')
    gestiones.value = response.data.gestiones || []

    // Intentar seleccionar la gestión activa por defecto
    const gestionActiva = gestiones.value.find(g => g.estado === 1)
    if (gestionActiva) {
      gestionSeleccionada.value = {
        id: gestionActiva.id,
        nombre: `${gestionActiva.nombre} (${gestionActiva.anio})`
      }
    } else if (gestiones.value.length > 0) {
      gestionSeleccionada.value = {
        id: gestiones.value[0].id,
        nombre: `${gestiones.value[0].nombre} (${gestiones.value[0].anio})`
      }
    }
  } catch (error) {
    console.error('Error al cargar gestiones:', error)
    $q.notify({
      message: 'Error al cargar las gestiones académicas',
      color: 'negative'
    })
  }
}

// Cargar lista de evaluaciones del docente
async function cargarEvaluaciones() {
  cargando.value = true
  try {
    const response = await api.get('/evaluaciones/docente')
    evaluaciones.value = response.data.evaluaciones || []

    // Asegurarse de que cada evaluación tenga estadísticas
    evaluaciones.value = evaluaciones.value.map(evaluacion => {
      if (!evaluacion.estadisticas) {
        evaluacion.estadisticas = {
          total_estudiantes: 0,
          completados: 0,
          pendientes: 0
        }
      }
      return evaluacion
    })

    if (evaluaciones.value.length === 0) {
      $q.notify({
        message: 'No se encontraron evaluaciones',
        color: 'warning'
      })
    }
  } catch (error) {
    console.error('Error al cargar evaluaciones:', error)
    evaluaciones.value = []
    $q.notify({
      message: 'Error al cargar las evaluaciones',
      color: 'negative'
    })
  } finally {
    cargando.value = false
  }
}

// Función para ver detalles de una evaluación
function verDetalle(evaluacion) {
  // Redireccionar a la página de detalles o mostrar un modal con más información
  window.location.href = `/app/docentes/detalle-evaluacion/${evaluacion.id}`
}

// Función para formatear fechas
function formatearFecha(fecha) {
  if (!fecha) return 'N/A'

  try {
    const date = new Date(fecha)
    if (isNaN(date.getTime())) return 'Fecha inválida'
    return date.toLocaleDateString()
  } catch (error) {
    console.error('Error al formatear fecha:', error)
    return 'Error'
  }
}

// Función para formatear fechas con hora
function formatearFechaHora(fecha) {
  if (!fecha) return 'N/A'

  try {
    const date = new Date(fecha)
    if (isNaN(date.getTime())) return 'Fecha/hora inválida'
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
  } catch (error) {
    console.error('Error al formatear fecha con hora:', error)
    return 'Error'
  }
}

// Función para obtener título del caso
function getCasoTitulo(calificacion) {
  // Para el nuevo formato de datos que hemos procesado
  if (calificacion.caso_titulo) {
    return calificacion.caso_titulo;
  }

  // Verificar diferentes estructuras posibles de datos (para compatibilidad)
  if (calificacion.caso && calificacion.caso.titulo) {
    return calificacion.caso.titulo;
  }

  if (calificacion.evaluacion_caso && calificacion.evaluacion_caso.caso && calificacion.evaluacion_caso.caso.titulo) {
    return calificacion.evaluacion_caso.caso.titulo;
  }

  return 'N/A';
}

// Función para obtener color según puntaje
function getColorPuntaje(puntaje) {
  if (puntaje >= 80) return 'positive'
  if (puntaje >= 60) return 'warning'
  return 'negative'
}

// Función para determinar el estado de la evaluación
function getEstadoTexto(evaluacion) {
  try {
    const ahora = new Date()
    let fechaInicio, fechaFin

    // Manejar diferentes formatos de fecha
    if (evaluacion.fecha_inicio) {
      fechaInicio = evaluacion.fecha_inicio instanceof Date
        ? evaluacion.fecha_inicio
        : new Date(evaluacion.fecha_inicio)
    } else {
      return 'Indefinido'
    }

    if (evaluacion.fecha_fin) {
      fechaFin = evaluacion.fecha_fin instanceof Date
        ? evaluacion.fecha_fin
        : new Date(evaluacion.fecha_fin)
    } else {
      return 'Indefinido'
    }

    // En caso de fechas inválidas
    if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
      return 'Indefinido'
    }

    if (ahora < fechaInicio) {
      return 'Pendiente'
    } else if (ahora > fechaFin) {
      return 'Finalizada'
    } else {
      return 'En curso'
    }
  } catch (error) {
    console.error('Error al determinar estado:', error)
    return 'Indefinido'
  }
}

// Función para obtener color según estado
function getColorEstado(evaluacion) {
  const estado = getEstadoTexto(evaluacion)

  switch (estado) {
    case 'Pendiente':
      return 'blue'
    case 'En curso':
      return 'green'
    case 'Finalizada':
      return 'orange'
    default:
      return 'grey'
  }
}

// Función para paginación (si se necesita)
function onRequest(props) {
  pagination.value = props.pagination
}

// Función para ver calificaciones de estudiantes
async function verCalificaciones(evaluacion) {
  evaluacionSeleccionada.value = evaluacion
  mostrarCalificaciones.value = true
  cargandoCalificaciones.value = true

  try {
    // Obtener calificaciones de estudiantes para esta evaluación
    const response = await api.get(`/evaluaciones/${evaluacion.id}/estudiantes`)

    // Procesamos los datos que vienen del backend a un formato plano para la tabla
    if (response.data && response.data.estudiantes) {
      const estudiantesData = response.data.estudiantes
      const calificacionesFormateadas = []

      // Verificar si hay datos
      if (estudiantesData.length === 0) {
        $q.notify({
          message: 'No se encontraron estudiantes para esta evaluación',
          color: 'warning'
        })
        calificacionesEstudiantes.value = []
        cargandoCalificaciones.value = false
        return
      }

      // Iteramos sobre cada estudiante
      estudiantesData.forEach(estudiante => {
        // Si el estudiante tiene nombre completo, lo usamos
        const nombreCompleto = estudiante.nombre_completo || ''

        // Dividir el nombre completo en partes (nombre y apellidos)
        const partes = nombreCompleto.split(' ')
        const nombre = partes[0] || ''
        const apellido1 = partes.length > 1 ? partes[1] : ''
        const apellido2 = partes.length > 2 ? partes.slice(2).join(' ') : ''

        // Tomamos el primer caso/evaluación para simplificar
        // (Si un estudiante tiene múltiples casos, se podrían mostrar como filas separadas)
        if (estudiante.evaluaciones && estudiante.evaluaciones.length > 0) {
          estudiante.evaluaciones.forEach(evaluacion => {
            calificacionesFormateadas.push({
              id: estudiante.id,
              estudiante: {
                id: estudiante.id,
                nombres: nombre,
                apellido1: apellido1,
                apellido2: apellido2
              },
              caso_titulo: evaluacion.caso_titulo || 'N/A',
              puntaje: evaluacion.nota || 0,
              completado: evaluacion.estado === 'Completada',
              intentada: evaluacion.estado !== 'No realizada',
              fecha_intento: evaluacion.fecha_intento
            })
          })
        } else {
          // Si no hay evaluaciones, crear una entrada genérica
          calificacionesFormateadas.push({
            id: estudiante.id,
            estudiante: {
              id: estudiante.id,
              nombres: nombre,
              apellido1: apellido1,
              apellido2: apellido2
            },
            caso_titulo: 'N/A',
            puntaje: 0,
            completado: false,
            intentada: false,
            fecha_intento: null
          })
        }
      })

      // Guardar datos formateados
      calificacionesEstudiantes.value = calificacionesFormateadas

      // Log para depuración
      console.log('Datos formateados para la tabla:', calificacionesFormateadas)
    } else {
      calificacionesEstudiantes.value = []
      $q.notify({
        message: 'No se encontraron estudiantes para esta evaluación',
        color: 'warning'
      })
    }
  } catch (error) {
    console.error('Error al cargar calificaciones:', error)
    calificacionesEstudiantes.value = []
    $q.notify({
      message: 'Error al cargar las calificaciones de los estudiantes',
      color: 'negative'
    })
  } finally {
    cargandoCalificaciones.value = false
  }
}

// Función para exportar todas las evaluaciones a PDF
function exportarListaPDF() {
  try {
    if (!evaluaciones.value || evaluaciones.value.length === 0) {
      $q.notify({
        message: 'No hay evaluaciones para exportar',
        color: 'warning'
      })
      return
    }

    const doc = new jsPDF()

    // Título
    doc.setFontSize(18)
    doc.text('Mis Evaluaciones', 14, 20)

    // Fecha
    const fecha = new Date().toLocaleDateString()
    doc.setFontSize(12)
    doc.text(`Fecha de emisión: ${fecha}`, 14, 30)

    // Filtrar posibles valores nulos o inválidos
    const evaluacionesValidas = evaluaciones.value.filter(ev => ev !== null && ev !== undefined)

    if (evaluacionesValidas.length === 0) {
      doc.text('No hay evaluaciones disponibles', 14, 40)
    } else {
      // Tabla de evaluaciones
      const tableColumn = ["Título", "Materia", "Grupo", "Fecha Inicio", "Fecha Fin", "Estado"]
      const tableRows = []

      evaluacionesValidas.forEach(evaluacion => {
        tableRows.push([
          evaluacion.titulo || 'Sin título',
          evaluacion.materia?.nombre || 'N/A',
          evaluacion.grupo?.nombre || 'N/A',
          formatearFecha(evaluacion.fecha_inicio),
          formatearFecha(evaluacion.fecha_fin),
          getEstadoTexto(evaluacion)
        ])
      })

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        theme: 'striped',
        headStyles: { fillColor: [75, 0, 130] },
        columnStyles: {
          0: { cellWidth: 40 }, // Título
          1: { cellWidth: 30 }, // Materia
          2: { cellWidth: 20 }, // Grupo
          3: { cellWidth: 25 }, // Fecha Inicio
          4: { cellWidth: 25 }, // Fecha Fin
          5: { cellWidth: 20 }  // Estado
        },
        styles: {
          overflow: 'ellipsize',
          cellPadding: 2
        }
      })
    }

    // Guardar PDF
    doc.save('mis-evaluaciones.pdf')

    $q.notify({
      message: 'Lista de evaluaciones exportada a PDF correctamente',
      color: 'positive'
    })
  } catch (error) {
    console.error('Error al exportar la lista de evaluaciones a PDF:', error)
    $q.notify({
      message: 'Error al generar el archivo PDF',
      color: 'negative'
    })
  }
}

// Función para exportar lista de evaluaciones a Excel
function exportarListaExcel() {
  try {
    if (!evaluaciones.value || evaluaciones.value.length === 0) {
      $q.notify({
        message: 'No hay evaluaciones para exportar',
        color: 'warning'
      })
      return
    }

    // Crear un nuevo workbook de Excel
    const wb = XLSX.utils.book_new()

    // Preparar datos para la hoja de evaluaciones
    const evaluacionesFilas = []
    evaluacionesFilas.push(['Título', 'Materia', 'Grupo', 'Fecha Inicio', 'Fecha Fin', 'Estado'])

    evaluaciones.value.forEach(evaluacion => {
      evaluacionesFilas.push([
        evaluacion.titulo || 'Sin título',
        evaluacion.materia?.nombre || 'N/A',
        evaluacion.grupo?.nombre || 'N/A',
        formatearFecha(evaluacion.fecha_inicio),
        formatearFecha(evaluacion.fecha_fin),
        getEstadoTexto(evaluacion)
      ])
    })

    // Crear hoja de evaluaciones
    const wsEvaluaciones = XLSX.utils.aoa_to_sheet(evaluacionesFilas)
    XLSX.utils.book_append_sheet(wb, wsEvaluaciones, 'Evaluaciones')

    // Guardar el archivo
    XLSX.writeFile(wb, 'mis-evaluaciones.xlsx')

    $q.notify({
      message: 'Lista de evaluaciones exportada a Excel correctamente',
      color: 'positive'
    })
  } catch (error) {
    console.error('Error al exportar la lista de evaluaciones a Excel:', error)
    $q.notify({
      message: 'Error al generar el archivo Excel',
      color: 'negative'
    })
  }
}

// Función para exportar una evaluación específica a PDF
function exportarEvaluacionPDF(evaluacion) {
  try {
    const doc = new jsPDF()

    // Título
    doc.setFontSize(18)
    doc.text(`Evaluación: ${evaluacion.titulo || 'Sin título'}`, 14, 20)

    // Información de la evaluación
    doc.setFontSize(12)
    doc.text(`Materia: ${evaluacion.materia ? evaluacion.materia.nombre : 'N/A'}`, 14, 30)
    doc.text(`Grupo: ${evaluacion.grupo ? evaluacion.grupo.nombre : 'N/A'}`, 14, 38)

    if (evaluacion.fecha_inicio && evaluacion.fecha_fin) {
      doc.text(`Período: ${formatearFecha(evaluacion.fecha_inicio)} - ${formatearFecha(evaluacion.fecha_fin)}`, 14, 46)
    }

    doc.text(`Estado: ${getEstadoTexto(evaluacion)}`, 14, 54)

    // Fecha
    const fecha = new Date().toLocaleDateString()
    doc.text(`Fecha de emisión: ${fecha}`, 14, 62)

    // Cargar estudiantes para incluir sus calificaciones
    cargandoCalificaciones.value = true

    api.get(`/evaluaciones/${evaluacion.id}/estudiantes`)
      .then(response => {
        // Procesar y validar los datos recibidos
        const estudiantesData = response.data?.estudiantes || []

        // Estudiantes formateados para el PDF
        const estudiantesFormateados = []

        estudiantesData.forEach(estudiante => {
          // Dividir el nombre completo en partes (nombre y apellidos)
          const nombreCompleto = estudiante.nombre_completo || ''
          const partes = nombreCompleto.split(' ')
          const nombre = partes[0] || ''
          const apellido = partes.length > 1 ? partes.slice(1).join(' ') : ''

          if (estudiante.evaluaciones && estudiante.evaluaciones.length > 0) {
            estudiante.evaluaciones.forEach(evaluacion => {
              estudiantesFormateados.push({
                nombre: nombre,
                apellido: apellido,
                caso: evaluacion.caso_titulo || 'N/A',
                puntaje: evaluacion.nota || 0,
                estado: evaluacion.estado || 'No iniciado'
              })
            })
          } else {
            estudiantesFormateados.push({
              nombre: nombre,
              apellido: apellido,
              caso: 'N/A',
              puntaje: 0,
              estado: 'No iniciado'
            })
          }
        })

        doc.text(`Estudiantes asignados: ${estudiantesFormateados.length}`, 14, 70)

        if (estudiantesFormateados.length > 0) {
          // Tabla de estudiantes
          const tableColumn = ["Nombres", "Apellidos", "Caso", "Puntaje", "Estado"]
          const tableRows = []

          estudiantesFormateados.forEach(est => {
            tableRows.push([
              est.nombre,
              est.apellido,
              est.caso,
              est.puntaje,
              est.estado
            ])
          })

          autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 78,
            theme: 'striped',
            headStyles: { fillColor: [75, 0, 130] }
          })
        } else {
          doc.text('No hay estudiantes asignados a esta evaluación', 14, 78)
        }

        // Guardar PDF
        doc.save(`evaluacion-${evaluacion.titulo || 'sin-titulo'}.pdf`)

        $q.notify({
          message: 'Archivo PDF de la evaluación generado correctamente',
          color: 'positive'
        })

        cargandoCalificaciones.value = false
      })
      .catch(error => {
        console.error('Error al cargar calificaciones para PDF:', error)

        doc.text('No se pudieron cargar los datos de estudiantes', 14, 78)

        // Guardar PDF incluso si no hay datos de estudiantes
        doc.save(`evaluacion-${evaluacion.titulo || 'sin-titulo'}.pdf`)

        $q.notify({
          message: 'Archivo PDF generado con información parcial',
          color: 'warning'
        })

        cargandoCalificaciones.value = false
      })
  } catch (error) {
    console.error('Error al exportar PDF de la evaluación:', error)
    $q.notify({
      message: 'Error al generar el archivo PDF de la evaluación',
      color: 'negative'
    })
    cargandoCalificaciones.value = false
  }
}

// Función para exportar una evaluación específica a Excel
function exportarEvaluacionExcel(evaluacion) {
  try {
    // Cargar calificaciones para esta evaluación
    cargandoCalificaciones.value = true

    // Obtener la lista de estudiantes directamente desde el backend
    api.get(`/evaluaciones/${evaluacion.id}/estudiantes`)
      .then(response => {
        const estudiantesData = response.data?.estudiantes || []

        // Log para depuración
        console.log('Datos de estudiantes recibidos del backend:', estudiantesData)

        if (estudiantesData.length === 0) {
          $q.notify({
            message: 'No hay estudiantes para exportar en esta evaluación',
            color: 'warning'
          })
          cargandoCalificaciones.value = false
          return
        }

        // Crear un nuevo workbook de Excel
        const wb = XLSX.utils.book_new()

        // Datos para la hoja de información general
        const infoData = [
          ['Evaluación', evaluacion.titulo || 'Sin título'],
          ['Materia', evaluacion.materia?.nombre || 'N/A'],
          ['Grupo', evaluacion.grupo?.nombre || 'N/A'],
          ['Período', `${formatearFecha(evaluacion.fecha_inicio)} - ${formatearFecha(evaluacion.fecha_fin)}`],
          ['Estado', getEstadoTexto(evaluacion)],
          ['Fecha de emisión', new Date().toLocaleDateString()],
          ['Total de estudiantes', estudiantesData.length.toString()]
        ]

        // Crear hoja de información general
        const wsInfo = XLSX.utils.aoa_to_sheet(infoData)
        XLSX.utils.book_append_sheet(wb, wsInfo, 'Información')

        // Crear una matriz para estudiantes - importante usar matrices directamente
        const datos = []
        datos.push(['Nombres', 'Apellidos', 'Caso Asignado', 'Puntaje', 'Estado'])

        // Procesar cada estudiante y sus evaluaciones
        estudiantesData.forEach(estudiante => {
          const nombreCompleto = estudiante.nombre_completo || ''

          // Log del nombre completo para depuración
          console.log('Nombre completo del estudiante:', nombreCompleto)

          // Usar la nueva función para separar nombres y apellidos correctamente
          const { nombres, apellidos } = separarNombresApellidos(nombreCompleto)

          // Verificar si el estudiante tiene evaluaciones
          if (estudiante.evaluaciones && estudiante.evaluaciones.length > 0) {
            // CAMBIO AQUÍ: eval → evaluacionItem
            estudiante.evaluaciones.forEach(evaluacionItem => {
              // Para depuración
              console.log('Evaluación:', evaluacionItem)
              console.log('Nombres procesados:', nombres)
              console.log('Apellidos procesados:', apellidos)

              // Agregar fila a los datos
              datos.push([
                nombres,
                apellidos,
                evaluacionItem.caso_titulo || 'N/A',
                evaluacionItem.nota || 0,
                evaluacionItem.estado || 'No iniciado'
              ])
            })
          } else {
            // Si no tiene evaluaciones, agregar una fila con datos básicos
            datos.push([
              nombres,
              apellidos,
              'N/A',
              0,
              'No iniciado'
            ])
          }
        })

        // Registrar los datos que vamos a enviar a Excel
        console.log('Datos preparados para Excel:', datos)

        // Crear hoja de estudiantes con los datos de la matriz
        const wsEstudiantes = XLSX.utils.aoa_to_sheet(datos)
        XLSX.utils.book_append_sheet(wb, wsEstudiantes, 'Estudiantes')

        // Guardar el archivo
        XLSX.writeFile(wb, `evaluacion-${evaluacion.titulo || 'sin-titulo'}.xlsx`)

        $q.notify({
          message: 'Archivo Excel de la evaluación generado correctamente',
          color: 'positive'
        })

        cargandoCalificaciones.value = false
      })
      .catch(error => {
        console.error('Error al cargar calificaciones para Excel:', error)
        $q.notify({
          message: 'Error al generar el archivo Excel. No se pudieron cargar los datos.',
          color: 'negative'
        })
        cargandoCalificaciones.value = false
      })
  } catch (error) {
    console.error('Error al exportar Excel de la evaluación:', error)
    $q.notify({
      message: 'Error al generar el archivo Excel de la evaluación',
      color: 'negative'
    })
    cargandoCalificaciones.value = false
  }
}
function separarNombresApellidos(nombreCompleto) {
  if (!nombreCompleto || nombreCompleto.trim() === '') {
    return { nombres: 'N/A', apellidos: 'N/A' }
  }

  const partes = nombreCompleto.trim().split(' ').filter(parte => parte.length > 0)

  if (partes.length === 0) {
    return { nombres: 'N/A', apellidos: 'N/A' }
  } else if (partes.length === 1) {
    return { nombres: partes[0], apellidos: '' }
  } else if (partes.length === 2) {
    return { nombres: partes[0], apellidos: partes[1] }
  } else if (partes.length === 3) {
    return { nombres: partes[0], apellidos: `${partes[1]} ${partes[2]}` }
  } else {
    // Para 4 o más partes: primeros 2 como nombres, últimos 2 como apellidos
    const nombres = partes.slice(0, 2).join(' ')
    const apellidos = partes.slice(2).join(' ')
    return { nombres, apellidos }
  }
}
// Función para exportar calificaciones a PDF (desde el modal)
function exportarCalificacionesPDF() {
  try {
    if (!calificacionesEstudiantes.value || calificacionesEstudiantes.value.length === 0) {
      $q.notify({
        message: 'No hay calificaciones para exportar',
        color: 'warning'
      })
      return
    }

    const doc = new jsPDF()

    // Título
    doc.setFontSize(18)
    doc.text(`Calificaciones - ${evaluacionSeleccionada.value.titulo || 'Evaluación'}`, 14, 20)

    // Información de la evaluación
    doc.setFontSize(12)
    doc.text(`Materia: ${evaluacionSeleccionada.value.materia?.nombre || 'N/A'}`, 14, 30)
    doc.text(`Grupo: ${evaluacionSeleccionada.value.grupo?.nombre || 'N/A'}`, 14, 38)

    if (evaluacionSeleccionada.value.fecha_inicio && evaluacionSeleccionada.value.fecha_fin) {
      doc.text(`Período: ${formatearFecha(evaluacionSeleccionada.value.fecha_inicio)} - ${formatearFecha(evaluacionSeleccionada.value.fecha_fin)}`, 14, 46)
    }

    // Fecha
    const fecha = new Date().toLocaleDateString()
    doc.text(`Fecha de emisión: ${fecha}`, 14, 54)

    // Filtrar posibles valores nulos o inválidos
    const estudiantesValidos = calificacionesEstudiantes.value.filter(est => est !== null && est !== undefined)

    // Tabla de calificaciones - Usar los mismos datos que se muestran en la tabla
    const tableColumn = ["Nombres", "Apellidos", "Caso Asignado", "Puntaje", "Estado"]
    const tableRows = []

    estudiantesValidos.forEach(est => {
      let nombreCompleto = '';

      // Construir el nombre completo
      if (est.estudiante) {
        if (est.estudiante.nombres) {
          nombreCompleto = est.estudiante.nombres;
        }

        if (est.estudiante.apellido1) {
          nombreCompleto += ' ' + est.estudiante.apellido1;
        }

        if (est.estudiante.apellido2 && est.estudiante.apellido2.trim() !== '') {
          nombreCompleto += ' ' + est.estudiante.apellido2;
        }
      }

      // Procesar el nombre completo para dividirlo correctamente
      const { nombres, apellidos } = separarNombresApellidos(nombreCompleto);

      tableRows.push([
        nombres,
        apellidos,
        getCasoTitulo(est),
        est.puntaje || 0,
        est.completado ? 'Completado' : (est.intentada ? 'En progreso' : 'No iniciado')
      ])
    })

    // Verificar si hay filas antes de crear la tabla
    if (tableRows.length === 0) {
      doc.text('No hay datos de estudiantes para mostrar', 14, 70)
    } else {
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 62,
        theme: 'striped',
        headStyles: { fillColor: [75, 0, 130] }
      })
    }

    // Guardar PDF
    doc.save(`calificaciones-${evaluacionSeleccionada.value.titulo || 'evaluacion'}.pdf`)

    $q.notify({
      message: 'Calificaciones exportadas a PDF correctamente',
      color: 'positive'
    })
  } catch (error) {
    console.error('Error al exportar calificaciones a PDF:', error)
    $q.notify({
      message: 'Error al generar el archivo PDF de calificaciones',
      color: 'negative'
    })
  }
}

// Función para exportar calificaciones a Excel (desde el modal)
function exportarCalificacionesExcel() {
  try {
    if (!calificacionesEstudiantes.value || calificacionesEstudiantes.value.length === 0) {
      $q.notify({
        message: 'No hay calificaciones para exportar',
        color: 'warning'
      })
      return
    }

    // Filtrar posibles valores nulos o inválidos
    const estudiantesValidos = calificacionesEstudiantes.value.filter(est => est !== null && est !== undefined)

    if (estudiantesValidos.length === 0) {
      $q.notify({
        message: 'No hay datos válidos para exportar',
        color: 'warning'
      })
      return
    }

    // Log para ver los datos antes de procesar
    console.log('Datos de estudiantes para exportar a Excel:', estudiantesValidos)

    // Crear un nuevo workbook de Excel
    const wb = XLSX.utils.book_new()

    // Datos para la hoja de información general
    const infoData = [
      ['Evaluación', evaluacionSeleccionada.value.titulo || 'Sin título'],
      ['Materia', evaluacionSeleccionada.value.materia?.nombre || 'N/A'],
      ['Grupo', evaluacionSeleccionada.value.grupo?.nombre || 'N/A'],
      ['Período', `${formatearFecha(evaluacionSeleccionada.value.fecha_inicio)} - ${formatearFecha(evaluacionSeleccionada.value.fecha_fin)}`],
      ['Estado', getEstadoTexto(evaluacionSeleccionada.value)],
      ['Fecha de emisión', new Date().toLocaleDateString()],
      ['Total de estudiantes', estudiantesValidos.length.toString()]
    ]

    // Crear hoja de información general
    const wsInfo = XLSX.utils.aoa_to_sheet(infoData)
    XLSX.utils.book_append_sheet(wb, wsInfo, 'Información')

    // Preparar datos para la hoja de calificaciones en formato de matriz
    const calificacionesFilas = [
      ['Nombres', 'Apellidos', 'Caso Asignado', 'Puntaje', 'Estado']
    ]

    // Para depuración detallada
    estudiantesValidos.forEach((est, index) => {
      console.log(`Procesando estudiante ${index}:`, est)
      console.log('Nombres:', est.estudiante?.nombres)
      console.log('Apellidos:', est.estudiante ? `${est.estudiante.apellido1 || ''} ${est.estudiante.apellido2 || ''}` : 'N/A')

      const nombres = est.estudiante?.nombres || 'N/A'
      const apellidos = est.estudiante ? `${est.estudiante.apellido1 || ''} ${est.estudiante.apellido2 || ''}` : 'N/A'

      calificacionesFilas.push([
        nombres,
        apellidos,
        getCasoTitulo(est),
        est.puntaje || 0,
        est.completado ? 'Completado' : (est.intentada ? 'En progreso' : 'No iniciado')
      ])
    })

    // Log de la matriz final
    console.log('Matriz de datos para Excel:', calificacionesFilas)

    // Crear hoja de calificaciones
    const wsCalificaciones = XLSX.utils.aoa_to_sheet(calificacionesFilas)
    XLSX.utils.book_append_sheet(wb, wsCalificaciones, 'Calificaciones')

    // Guardar el archivo
    XLSX.writeFile(wb, `calificaciones-${evaluacionSeleccionada.value.titulo || 'evaluacion'}.xlsx`)

    $q.notify({
      message: 'Calificaciones exportadas a Excel correctamente',
      color: 'positive'
    })
  } catch (error) {
    console.error('Error al exportar calificaciones a Excel:', error)
    $q.notify({
      message: 'Error al generar el archivo Excel de calificaciones',
      color: 'negative'
    })
  }
}
</script>

<style scoped>
.q-table__card {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.q-btn:hover {
  transform: translateY(-2px);
  transition: transform 0.2s;
}

.q-card {
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>
