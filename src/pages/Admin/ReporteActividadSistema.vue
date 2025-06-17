<template>
  <q-page padding class="bg-grey-1">
    <div class="row q-mb-md">
      <div class="col-12">
        <q-card class="bg-deep-purple-10 text-white">
          <q-card-section>
            <div class="text-h5">Reporte de Actividad del Sistema</div>
            <div class="text-subtitle2">Estadísticas de uso y actividad en la plataforma</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Filtros -->
    <q-card class="q-mb-md animate__animated animate__fadeIn">
      <q-card-section>
        <div class="text-h6 q-mb-md">Filtros</div>
        <div class="row q-col-gutter-md">
          <!-- Rango de fechas -->
          <div class="col-12 col-sm-6 col-md-4">
            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <q-input filled v-model="filtros.fechaInicio" label="Fecha inicio" placeholder="YYYY-MM-DD" dense
                  readonly>
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="filtros.fechaInicio" minimal today-btn mask="YYYY-MM-DD">
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Aceptar" color="primary" flat />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
              <div class="col-6">
                <q-input filled v-model="filtros.fechaFin" label="Fecha fin" placeholder="YYYY-MM-DD" dense readonly>
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="filtros.fechaFin" minimal today-btn mask="YYYY-MM-DD">
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Aceptar" color="primary" flat />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
            </div>
          </div>

          <!-- Gestión -->
          <div class="col-12 col-sm-6 col-md-3">
            <q-select v-model="filtros.gestionId" :options="opcionesGestiones" label="Gestión Académica" outlined dense
              emit-value map-options clearable />
          </div>

          <!-- Tipo de Actividad -->
          <div class="col-12 col-sm-6 col-md-3">
            <q-select v-model="filtros.tipoActividad" :options="opcionesTipoActividad" label="Tipo de Actividad"
              outlined dense emit-value map-options clearable />
          </div>

          <!-- Agrupación -->
          <div class="col-12 col-sm-6 col-md-2">
            <q-select v-model="filtros.agrupacion" :options="opcionesAgrupacion" label="Agrupación" outlined dense
              emit-value map-options />
          </div>
        </div>

        <div class="row q-mt-md">
          <div class="col-12">
            <q-btn color="primary" icon="search" label="Generar Reporte" @click="cargarDatos" :loading="cargando"
              class="q-mr-sm" />
            <q-btn color="green" icon="download" label="Descargar Excel" @click="descargarExcel" :disable="!hayDatos"
              class="q-mr-sm" />
            <q-btn color="deep-orange" icon="picture_as_pdf" label="Descargar PDF" @click="descargarPDF"
              :disable="!hayDatos" />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Tarjetas de resumen -->
    <div class="row q-col-gutter-md q-mb-md" v-if="hayDatos">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-blue-7 text-white animate__animated animate__fadeInUp">
          <q-card-section>
            <div class="text-h4 text-center">{{ resumen.totalResoluciones }}</div>
            <div class="text-subtitle1 text-center">Resoluciones Totales</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-teal-7 text-white animate__animated animate__fadeInUp" style="animation-delay: 0.1s">
          <q-card-section>
            <div class="text-h4 text-center">{{ resumen.totalEstudiantes }}</div>
            <div class="text-subtitle1 text-center">Estudiantes Activos</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-deep-purple-7 text-white animate__animated animate__fadeInUp" style="animation-delay: 0.2s">
          <q-card-section>
            <div class="text-h4 text-center">{{ resumen.casosUtilizados }}</div>
            <div class="text-subtitle1 text-center">Casos Utilizados</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-orange-7 text-white animate__animated animate__fadeInUp" style="animation-delay: 0.3s">
          <q-card-section>
            <div class="text-h4 text-center">{{ resumen.promedioRendimiento }}%</div>
            <div class="text-subtitle1 text-center">Rendimiento Promedio</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Gráficos -->
    <div class="row q-col-gutter-md" v-if="hayDatos">
      <!-- Gráfico de actividad por tiempo -->
      <div class="col-12 col-md-6">
        <q-card class="animate__animated animate__fadeIn chart-card">
          <q-card-section>
            <div class="text-h6">Actividad por {{ filtros.agrupacion === 'dia' ? 'Día' : filtros.agrupacion === 'semana'
              ?
              'Semana' : 'Mes' }}</div>
            <div class="chart-container">
              <canvas ref="actividadChart"></canvas>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Gráfico de distribución por tipo -->
      <div class="col-12 col-md-6">
        <q-card class="animate__animated animate__fadeIn chart-card" style="animation-delay: 0.2s">
          <q-card-section>
            <div class="text-h6">Distribución por Tipo de Actividad</div>
            <div class="chart-container">
              <canvas ref="tipoActividadChart"></canvas>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Gráfico de horas del día -->
      <div class="col-12 col-md-6">
        <q-card class="animate__animated animate__fadeIn chart-card" style="animation-delay: 0.3s">
          <q-card-section>
            <div class="text-h6">Actividad por Hora del Día</div>
            <div class="chart-container">
              <canvas ref="horasChart"></canvas>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Gráfico de rendimiento por materia -->
      <div class="col-12 col-md-6">
        <q-card class="animate__animated animate__fadeIn chart-card" style="animation-delay: 0.4s">
          <q-card-section>
            <div class="text-h6">Rendimiento por Materia</div>
            <div class="chart-container">
              <canvas ref="materiasChart"></canvas>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Tabla de resultados detallados -->
    <q-card class="q-mt-md animate__animated animate__fadeIn" v-if="hayDatos" style="animation-delay: 0.5s">
      <q-card-section>
        <div class="text-h6 q-mb-md">Detalle de Actividad</div>
        <q-table :rows="datosTabla" :columns="columnasTabla" row-key="id" v-model:pagination="paginacion"
          :loading="cargando" :filter="filtroTexto" flat bordered>
          <template v-slot:top-right>
            <q-input v-model="filtroTexto" outlined dense placeholder="Buscar en resultados" class="q-ml-md" clearable>
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Mensaje cuando no hay datos -->
    <q-card v-if="!hayDatos && !cargando" class="animate__animated animate__fadeIn q-mt-md">
      <q-card-section class="text-center">
        <q-icon name="info" color="primary" size="3rem" />
        <div class="text-h6 q-mt-md">No hay datos disponibles</div>
        <div class="text-body1 q-mt-sm">Selecciona filtros y haz clic en "Generar Reporte" para ver las estadísticas de
          actividad.</div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { defineComponent, ref, reactive, onMounted, computed, watch, nextTick } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
import { exportFile } from 'quasar'
import Chart from 'chart.js/auto'
import 'animate.css'
import * as XLSX from 'xlsx'

export default defineComponent({
  name: 'ReporteActividadSistema',

  setup() {
    const $q = useQuasar()
    const cargando = ref(false)
    const opcionesGestiones = ref([])
    const filtroTexto = ref('')

    // Referencias para los gráficos
    const actividadChart = ref(null)
    const tipoActividadChart = ref(null)
    const horasChart = ref(null)
    const materiasChart = ref(null)

    // Instancias de los gráficos
    let chartActividad = null
    let chartTipoActividad = null
    let chartHoras = null
    let chartMaterias = null

    // Datos para los gráficos
    const datosActividad = ref([])
    const datosTipoActividad = ref([])
    const datosHoras = ref([])
    const datosMaterias = ref([])
    const datosTabla = ref([])

    // Resumen de datos
    const resumen = reactive({
      totalResoluciones: 0,
      totalEstudiantes: 0,
      casosUtilizados: 0,
      promedioRendimiento: 0
    })

    // Opciones para selects
    const opcionesTipoActividad = [
      { label: 'Todas', value: 'todas' },
      { label: 'Práctica', value: 'practica' },
      { label: 'Evaluación', value: 'evaluacion' }
    ]

    const opcionesAgrupacion = [
      { label: 'Por Día', value: 'dia' },
      { label: 'Por Semana', value: 'semana' },
      { label: 'Por Mes', value: 'mes' }
    ]

    // Configuración de paginación para la tabla
    const paginacion = ref({
      sortBy: 'fecha',
      descending: true,
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 0
    })

    // Definición de columnas para la tabla
    const columnasTabla = [
      {
        name: 'fecha',
        label: 'Fecha',
        field: 'fecha',
        sortable: true,
        align: 'left'
      },
      {
        name: 'hora',
        label: 'Hora',
        field: 'hora',
        sortable: true,
        align: 'left'
      },
      {
        name: 'estudiante',
        label: 'Estudiante',
        field: 'estudiante',
        sortable: true,
        align: 'left'
      },
      {
        name: 'caso',
        label: 'Caso',
        field: 'caso',
        sortable: true,
        align: 'left'
      },
      {
        name: 'materia',
        label: 'Materia',
        field: 'materia',
        sortable: true,
        align: 'left'
      },
      {
        name: 'tipo',
        label: 'Tipo',
        field: 'tipo',
        sortable: true,
        align: 'left'
      },
      {
        name: 'puntaje',
        label: 'Puntaje',
        field: 'puntaje',
        sortable: true,
        align: 'right'
      }
    ]

    // Filtros para el reporte
    const fechaActual = new Date()
    const fechaInicio = new Date()
    fechaInicio.setMonth(fechaInicio.getMonth() - 1) // Por defecto último mes

    const filtros = reactive({
      fechaInicio: fechaInicio.toISOString().slice(0, 10),
      fechaFin: fechaActual.toISOString().slice(0, 10),
      gestionId: null,
      tipoActividad: 'todas',
      agrupacion: 'dia'
    })

    // Computed para verificar si hay datos
    const hayDatos = computed(() => {
      return datosTabla.value.length > 0
    })

    // Cargar datos iniciales
    onMounted(() => {
      cargarGestiones()
    })

    // Cargar gestiones académicas
    const cargarGestiones = async () => {
      try {
        const response = await api.get('/gestiones')
        opcionesGestiones.value = response.data.map(gestion => ({
          label: `${gestion.nombre} ${gestion.anio}`,
          value: gestion.id
        }))

        // Seleccionar la gestión activa por defecto
        const gestionActiva = response.data.find(g => g.estado === 1)
        if (gestionActiva) {
          filtros.gestionId = gestionActiva.id
        }
      } catch (error) {
        console.error('Error al cargar gestiones:', error)
        $q.notify({
          message: 'Error al cargar gestiones académicas',
          color: 'negative'
        })
      }
    }

    // Cargar datos del reporte
    const cargarDatos = async () => {
      cargando.value = true

      try {
        const response = await api.get('/reportes/actividad-sistema', {
          params: {
            fecha_inicio: filtros.fechaInicio,
            fecha_fin: filtros.fechaFin,
            gestion_id: filtros.gestionId,
            tipo_actividad: filtros.tipoActividad,
            agrupacion: filtros.agrupacion
          }
        })

        const data = response.data.data

        // Actualizar datos para los gráficos
        datosActividad.value = data.actividad_por_tiempo
        datosTipoActividad.value = data.distribucion_tipo
        datosHoras.value = data.actividad_por_hora
        datosMaterias.value = data.rendimiento_por_materia
        datosTabla.value = data.detalle_actividad

        // Actualizar resumen
        resumen.totalResoluciones = data.resumen.total_resoluciones
        resumen.totalEstudiantes = data.resumen.total_estudiantes
        resumen.casosUtilizados = data.resumen.casos_utilizados
        resumen.promedioRendimiento = data.resumen.promedio_rendimiento

        // Actualizar paginación
        paginacion.value.rowsNumber = datosTabla.value.length

        // Renderizar gráficos después que el DOM se actualice
        nextTick(() => {
          renderizarGraficos()
        })
      } catch (error) {
        console.error('Error al cargar datos:', error)
        $q.notify({
          message: 'Error al cargar datos del reporte: ' + (error.response?.data?.message || error.message),
          color: 'negative'
        })
      } finally {
        cargando.value = false
      }
    }

    // Renderizar gráficos
    const renderizarGraficos = () => {
      // Destruir gráficos existentes si hay
      if (chartActividad) chartActividad.destroy()
      if (chartTipoActividad) chartTipoActividad.destroy()
      if (chartHoras) chartHoras.destroy()
      if (chartMaterias) chartMaterias.destroy()

      // Opciones comunes para todos los gráficos
      const opcionesBase = {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            top: 10,
            bottom: 10
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            titleFont: {
              size: 13
            },
            bodyFont: {
              size: 12
            },
            padding: 10
          }
        }
      }

      // Crear gráfico de actividad por tiempo
      const ctxActividad = actividadChart.value.getContext('2d')
      chartActividad = new Chart(ctxActividad, {
        type: 'line',
        data: {
          labels: datosActividad.value.map(item => item.etiqueta),
          datasets: [
            {
              label: 'Resoluciones',
              data: datosActividad.value.map(item => item.cantidad),
              backgroundColor: 'rgba(81, 45, 168, 0.2)',
              borderColor: 'rgba(81, 45, 168, 1)',
              borderWidth: 2,
              tension: 0.3,
              fill: true,
              pointBackgroundColor: 'rgba(81, 45, 168, 1)',
              pointRadius: 4,
              pointHoverRadius: 6
            }
          ]
        },
        options: {
          ...opcionesBase,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0,
                font: {
                  size: 11
                }
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              }
            },
            x: {
              ticks: {
                maxRotation: 45,
                minRotation: 45,
                font: {
                  size: 10
                }
              },
              grid: {
                display: false
              }
            }
          },
          plugins: {
            ...opcionesBase.plugins,
            tooltip: {
              ...opcionesBase.plugins.tooltip,
              mode: 'index',
              intersect: false
            }
          }
        }
      })

      // Crear gráfico de distribución por tipo de actividad
      const ctxTipoActividad = tipoActividadChart.value.getContext('2d')
      chartTipoActividad = new Chart(ctxTipoActividad, {
        type: 'doughnut',
        data: {
          labels: datosTipoActividad.value.map(item => item.tipo),
          datasets: [
            {
              data: datosTipoActividad.value.map(item => item.cantidad),
              backgroundColor: [
                'rgba(81, 45, 168, 0.7)',
                'rgba(33, 150, 243, 0.7)'
              ],
              borderColor: [
                'rgba(81, 45, 168, 1)',
                'rgba(33, 150, 243, 1)'
              ],
              borderWidth: 1,
              hoverOffset: 15
            }
          ]
        },
        options: {
          ...opcionesBase,
          cutout: '60%',
          plugins: {
            ...opcionesBase.plugins,
            legend: {
              display: true,
              position: 'bottom',
              labels: {
                boxWidth: 12,
                padding: 15,
                font: {
                  size: 11
                }
              }
            }
          }
        }
      })

      // Crear gráfico de actividad por hora del día
      const ctxHoras = horasChart.value.getContext('2d')
      chartHoras = new Chart(ctxHoras, {
        type: 'bar',
        data: {
          labels: datosHoras.value.map(item => `${item.hora}:00`),
          datasets: [
            {
              label: 'Actividad',
              data: datosHoras.value.map(item => item.cantidad),
              backgroundColor: 'rgba(0, 150, 136, 0.7)',
              borderColor: 'rgba(0, 150, 136, 1)',
              borderWidth: 1,
              borderRadius: 4,
              maxBarThickness: 35
            }
          ]
        },
        options: {
          ...opcionesBase,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0,
                font: {
                  size: 11
                }
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                font: {
                  size: 10
                }
              }
            }
          }
        }
      })

      // Crear gráfico de rendimiento por materia
      const ctxMaterias = materiasChart.value.getContext('2d')
      chartMaterias = new Chart(ctxMaterias, {
        type: 'bar',
        data: {
          labels: datosMaterias.value.map(item => item.materia),
          datasets: [
            {
              label: 'Rendimiento Promedio',
              data: datosMaterias.value.map(item => item.promedio),
              backgroundColor: 'rgba(255, 152, 0, 0.7)',
              borderColor: 'rgba(255, 152, 0, 1)',
              borderWidth: 1,
              borderRadius: 4,
              maxBarThickness: 35
            }
          ]
        },
        options: {
          ...opcionesBase,
          scales: {
            y: {
              min: 0,
              max: 100,
              ticks: {
                callback: function (value) {
                  return value + '%'
                },
                font: {
                  size: 11
                }
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                maxRotation: 45,
                minRotation: 45,
                font: {
                  size: 10
                }
              }
            }
          },
          plugins: {
            ...opcionesBase.plugins,
            tooltip: {
              ...opcionesBase.plugins.tooltip,
              callbacks: {
                label: function (context) {
                  return `${context.dataset.label}: ${context.raw}%`
                }
              }
            }
          }
        }
      })
    }

    // Descargar reporte en Excel
    const descargarExcel = () => {
      try {
        // Formatear datos para el Excel
        const datosFormateados = datosTabla.value.map(item => ({
          Fecha: item.fecha,
          Hora: item.hora,
          Estudiante: item.estudiante,
          Caso: item.caso,
          Materia: item.materia,
          Tipo: item.tipo,
          Puntaje: item.puntaje
        }))

        // Crear hoja de resumen
        const resumenData = [
          ['REPORTE DE ACTIVIDAD DEL SISTEMA', ''],
          ['Fecha de generación:', new Date().toLocaleDateString()],
          ['Período analizado:', `${filtros.fechaInicio} al ${filtros.fechaFin}`],
          ['', ''],
          ['RESUMEN', ''],
          ['Total de resoluciones:', resumen.totalResoluciones],
          ['Estudiantes activos:', resumen.totalEstudiantes],
          ['Casos utilizados:', resumen.casosUtilizados],
          ['Rendimiento promedio:', `${resumen.promedioRendimiento}%`],
        ]

        // Crear workbook y agregar hojas
        const wb = XLSX.utils.book_new()

        // Agregar hoja de resumen
        const wsResumen = XLSX.utils.aoa_to_sheet(resumenData)
        XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen')

        // Agregar hoja de datos detallados
        const wsDetalle = XLSX.utils.json_to_sheet(datosFormateados)
        XLSX.utils.book_append_sheet(wb, wsDetalle, 'Detalle de Actividad')

        // Configurar ancho de columnas para la hoja de detalle
        const colWidths = [
          { wch: 12 }, // Fecha
          { wch: 8 },  // Hora
          { wch: 25 }, // Estudiante
          { wch: 30 }, // Caso
          { wch: 20 }, // Materia
          { wch: 12 }, // Tipo
          { wch: 8 }   // Puntaje
        ]
        wsDetalle['!cols'] = colWidths

        // Generar archivo y descargar
        const fechaArchivo = new Date().toISOString().slice(0, 10)
        const nombreArchivo = `reporte_actividad_sistema_${fechaArchivo}.xlsx`
        XLSX.writeFile(wb, nombreArchivo)

        $q.notify({
          message: 'Reporte Excel descargado correctamente',
          color: 'positive'
        })
      } catch (error) {
        console.error('Error al descargar Excel:', error)
        $q.notify({
          message: 'Error al generar el archivo Excel',
          color: 'negative'
        })
      }
    }

    // Descargar reporte en PDF
    const descargarPDF = async () => {
      try {
        // Mostrar indicador de carga
        $q.loading.show({
          message: 'Generando PDF...'
        })

        // Importar html2pdf dinámicamente
        const html2pdfModule = await import('html2pdf.js')
        const html2pdf = html2pdfModule.default

        // Crear un elemento contenedor para el PDF
        const container = document.createElement('div')
        container.style.padding = '20px'
        container.style.fontFamily = 'Arial, sans-serif'

        // Título del reporte
        const titulo = document.createElement('h1')
        titulo.textContent = 'Reporte de Actividad del Sistema'
        titulo.style.color = '#512da8'
        titulo.style.textAlign = 'center'
        titulo.style.marginBottom = '10px'
        container.appendChild(titulo)

        // Información del reporte
        const infoContainer = document.createElement('div')
        infoContainer.style.marginBottom = '20px'
        infoContainer.style.textAlign = 'center'
        infoContainer.style.fontSize = '12px'

        const fechaGeneracion = document.createElement('p')
        fechaGeneracion.textContent = `Fecha de generación: ${new Date().toLocaleDateString()}`
        infoContainer.appendChild(fechaGeneracion)

        const periodoAnalizado = document.createElement('p')
        periodoAnalizado.textContent = `Período analizado: ${filtros.fechaInicio} al ${filtros.fechaFin}`
        infoContainer.appendChild(periodoAnalizado)

        container.appendChild(infoContainer)

        // Sección de resumen
        const resumenContainer = document.createElement('div')
        resumenContainer.style.display = 'flex'
        resumenContainer.style.justifyContent = 'space-between'
        resumenContainer.style.marginBottom = '30px'

        const resumenItems = [
          { titulo: 'Total Resoluciones', valor: resumen.totalResoluciones, color: '#2196F3' },
          { titulo: 'Estudiantes Activos', valor: resumen.totalEstudiantes, color: '#009688' },
          { titulo: 'Casos Utilizados', valor: resumen.casosUtilizados, color: '#512da8' },
          { titulo: 'Rendimiento Promedio', valor: `${resumen.promedioRendimiento}%`, color: '#FF9800' }
        ]

        resumenItems.forEach(item => {
          const card = document.createElement('div')
          card.style.width = '22%'
          card.style.backgroundColor = item.color
          card.style.color = 'white'
          card.style.padding = '15px'
          card.style.borderRadius = '5px'
          card.style.textAlign = 'center'

          const valor = document.createElement('div')
          valor.textContent = item.valor
          valor.style.fontSize = '24px'
          valor.style.fontWeight = 'bold'
          card.appendChild(valor)

          const titulo = document.createElement('div')
          titulo.textContent = item.titulo
          titulo.style.fontSize = '14px'
          card.appendChild(titulo)

          resumenContainer.appendChild(card)
        })

        container.appendChild(resumenContainer)

        // Preparar y agregar espacio para gráficos
        // Nota: En la versión PDF actual solo mostraremos la tabla de datos
        // ya que los gráficos de Canvas requieren manipulación adicional para ser incluidos en un PDF

        const graficosInfo = document.createElement('div')
        graficosInfo.style.textAlign = 'center'
        graficosInfo.style.margin = '20px 0'
        graficosInfo.style.padding = '10px'
        graficosInfo.style.backgroundColor = '#f5f5f5'
        graficosInfo.style.borderRadius = '5px'
        graficosInfo.textContent = 'Para visualizar los gráficos completos, consulte la versión web del reporte.'
        container.appendChild(graficosInfo)

        // Tabla de datos
        const tablaTitle = document.createElement('h2')
        tablaTitle.textContent = 'Detalle de Actividad'
        tablaTitle.style.color = '#512da8'
        tablaTitle.style.marginTop = '20px'
        container.appendChild(tablaTitle)

        const tabla = document.createElement('table')
        tabla.style.width = '100%'
        tabla.style.borderCollapse = 'collapse'
        tabla.style.marginTop = '10px'
        tabla.style.fontSize = '10px'

        // Encabezado de tabla
        const thead = document.createElement('thead')
        const headerRow = document.createElement('tr')

        columnasTabla.forEach(col => {
          const th = document.createElement('th')
          th.textContent = col.label
          th.style.backgroundColor = '#512da8'
          th.style.color = 'white'
          th.style.padding = '8px'
          th.style.textAlign = col.align || 'left'
          headerRow.appendChild(th)
        })

        thead.appendChild(headerRow)
        tabla.appendChild(thead)

        // Cuerpo de tabla (limitado a primeras 20 filas para el PDF)
        const tbody = document.createElement('tbody')
        const filasPDF = datosTabla.value.slice(0, 20) // Limitar a 20 filas para el PDF

        filasPDF.forEach((row, index) => {
          const tr = document.createElement('tr')
          tr.style.backgroundColor = index % 2 === 0 ? '#f9f9f9' : 'white'

          // Añadir celdas
          Object.keys(row).forEach(key => {
            if (columnasTabla.some(col => col.field === key)) {
              const td = document.createElement('td')
              td.textContent = row[key]
              td.style.padding = '6px'
              td.style.borderBottom = '1px solid #ddd'

              // Alineación especial para puntaje
              if (key === 'puntaje') {
                td.style.textAlign = 'right'
                td.style.fontWeight = 'bold'

                // Color según puntaje
                if (row[key] >= 70) {
                  td.style.color = 'green'
                } else if (row[key] >= 50) {
                  td.style.color = 'orange'
                } else {
                  td.style.color = 'red'
                }
              }

              tr.appendChild(td)
            }
          })

          tbody.appendChild(tr)
        })

        tabla.appendChild(tbody)
        container.appendChild(tabla)

        // Nota sobre datos limitados
        if (datosTabla.value.length > 20) {
          const nota = document.createElement('p')
          nota.textContent = `Nota: El PDF muestra las primeras 20 filas de un total de ${datosTabla.value.length}. Descargue el Excel para ver todos los datos.`
          nota.style.fontSize = '10px'
          nota.style.fontStyle = 'italic'
          nota.style.color = '#666'
          nota.style.marginTop = '5px'
          container.appendChild(nota)
        }

        // Pie de página
        const footer = document.createElement('div')
        footer.style.marginTop = '30px'
        footer.style.textAlign = 'center'
        footer.style.fontSize = '10px'
        footer.style.color = '#666'
        footer.textContent = 'Sistema de Medicina - Reporte generado automáticamente'
        container.appendChild(footer)

        // Opciones para html2pdf
        const opt = {
          margin: [15, 15, 15, 15],
          filename: `reporte_actividad_sistema_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }

        // Generar PDF
        await html2pdf().from(container).set(opt).save()

        // Ocultar indicador de carga
        $q.loading.hide()

        $q.notify({
          message: 'Reporte PDF descargado correctamente',
          color: 'positive',
          position: 'top'
        })
      } catch (error) {
        // Ocultar indicador de carga en caso de error
        $q.loading.hide()

        console.error('Error al descargar PDF:', error)
        $q.notify({
          message: `Error al generar el archivo PDF: ${error.message}`,
          color: 'negative',
          position: 'top'
        })
      }
    }

    // Observar cambios en los filtros
    watch(() => filtros.gestionId, (newVal, oldVal) => {
      if (newVal !== oldVal) {
        // Podríamos cargar datos adicionales según la gestión seleccionada
      }
    })

    watch(() => filtros.agrupacion, (newVal, oldVal) => {
      if (newVal !== oldVal && hayDatos.value) {
        // Si hay datos y cambia la agrupación, recargar
        cargarDatos()
      }
    })

    return {
      cargando,
      filtros,
      opcionesGestiones,
      opcionesTipoActividad,
      opcionesAgrupacion,
      resumen,
      datosTabla,
      columnasTabla,
      paginacion,
      filtroTexto,
      hayDatos,
      cargarDatos,
      descargarExcel,
      descargarPDF,
      actividadChart,
      tipoActividadChart,
      horasChart,
      materiasChart
    }
  }
})
</script>

<style scoped>
.animate__animated {
  animation-duration: 0.5s;
}
</style>
