<template>
  <q-page class="bg-grey-1">
    <!-- Contenedor principal con margen y bordes redondeados -->
    <div class="q-pa-md">
      <q-card class="main-card q-mb-md">
        <q-card-section class="bg-primary text-white">
          <div class="text-center q-mb-lg">
            <div class="row justify-center items-center">
              <q-icon name="medical_services" size="md" class="q-mr-sm" />
              <h1 class="text-h4 q-ma-none">
                <template v-if="evaluacionId && evaluacionData">
                  {{ evaluacionData.titulo }}
                </template>
                <template v-else>
                  {{ caso.titulo }}
                </template>
              </h1>
            </div>
            <div class="text-subtitle1 q-mt-sm">Resolución de Caso Clínico</div>
          </div>
        </q-card-section>

        <!-- Tarjeta de cronómetro y progreso -->
        <q-card-section v-if="comenzado && !bloqueado" class="q-pb-none">
          <q-card class="timer-card q-mb-md">
            <q-card-section class="q-py-sm">
              <div class="row items-center justify-between">
                <div class="col-12 col-sm-4 q-mb-xs-sm text-center">
                  <div class="row items-center justify-center">
                    <q-icon name="schedule" color="primary" size="24px" class="q-mr-sm pulse-animation" />
                    <div class="text-h6 text-primary">
                      {{ Math.floor(relojResolucion / 60) }}:{{
                        String(Math.floor(relojResolucion % 60)).padStart(
                          2,
                          "0"
                        )
                      }}
                    </div>
                  </div>
                  <div class="text-caption text-grey">Tiempo restante</div>
                </div>

                <div class="col-12 col-sm-8">
                  <q-linear-progress :value="porcentajeTiempo / 100" :color="colorTiempo" size="10px" class="q-mt-sm"
                    rounded track-color="grey-3" />
                  <div class="row justify-between q-mt-xs">
                    <div class="text-caption text-grey">FIN</div>
                    <div class="text-caption text-grey">INICIO</div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </q-card-section>

        <!-- Banner informativo con reglas de calificación -->
        <q-card-section v-if="comenzado && !bloqueado" class="q-pb-none">
          <q-banner class="bg-blue-1 text-primary q-my-md" rounded>
            <template v-slot:avatar>
              <q-icon name="info" color="primary" />
            </template>
            <div class="text-body1 q-mb-xs">Reglas de calificación:</div>
            <ul class="q-mb-none">
              <li>
                Para <strong>Motivos de consulta</strong> y
                <strong>Exámenes</strong>: Por cada
                <strong>dos respuestas incorrectas</strong> se resta
                <strong>una respuesta correcta</strong>.
              </li>
              <li>
                Para <strong>Elementos clínicos</strong> (Signos, Síntomas y
                Síndromes): Cada fila debe estar
                <strong>completamente correcta</strong> para considerarse
                válida.
              </li>
              <li>Cada sección se evalúa de forma independiente.</li>
              <li>
                Selecciona solo los elementos que consideres correctos para
                maximizar tu puntuación.
              </li>
            </ul>
          </q-banner>
        </q-card-section>

        <!-- Botón historia clínica (con animación sutil) -->
        <q-card-section v-if="comenzado && !bloqueado && tipoLectura === 1" class="text-center q-pb-none">
          <q-btn color="primary" class="historia-btn q-px-lg q-py-sm" icon="description" label="VER HISTORIA CLÍNICA"
            @click="modalHistoria = true" />
        </q-card-section>

        <!-- Mensaje de bloqueo con alerta visual -->
        <q-card-section v-if="bloqueado" class="q-pa-md">
          <q-banner rounded class="bg-negative text-white">
            <template v-slot:avatar>
              <q-icon name="warning" />
            </template>
            <div class="text-h6">Tiempo finalizado</div>
            <div class="text-subtitle2">
              No puedes continuar con la resolución.
            </div>
          </q-banner>
        </q-card-section>

        <!-- Botón iniciar (animado) -->
        <q-card-section v-if="!comenzado" class="text-center q-py-xl">
          <q-icon name="play_circle" color="primary" size="80px" class="q-mb-md bounce-animation" />
          <div>
            <q-btn size="lg" label="COMENZAR PRUEBA" color="primary" class="q-px-xl q-py-sm comenzar-btn"
              @click="iniciarResolucion" />
          </div>
        </q-card-section>

        <!-- Formulario de resolución -->
        <q-card-section v-if="comenzado && !bloqueado" class="q-py-none">
          <div class="forms-container">
            <!-- Motivos de consulta -->
            <q-card class="form-section-card q-my-md">
              <q-card-section class="q-pb-none">
                <div class="section-header">
                  <q-icon name="contact_support" color="primary" size="24px" class="q-mr-sm" />
                  <div class="text-subtitle1 text-weight-bold text-primary">
                    MOTIVO/S DE CONSULTA
                  </div>
                </div>
              </q-card-section>

              <q-card-section>
                <div class="row q-col-gutter-md">
                  <div v-for="motivo in motivoConsultas" :key="motivo.id" class="col-12 col-sm-6 col-md-4">
                    <!-- Envolver el q-checkbox en un div con la clase checkbox-item -->
                    <div class="checkbox-item">
                      <q-checkbox v-model="res.motivos" :val="motivo.nombre" :label="motivo.nombre"
                        :disable="bloquearCampos" color="primary" />
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
            <div class="text-caption q-pb-sm text-grey-8">
              <q-icon name="help_outline" size="xs" class="q-mr-xs" />
              Para que una fila se considere correcta, todos sus campos deben
              estar correctos.
            </div>
            <!-- Signos -->
            <q-card class="form-section-card q-my-md">
              <q-card-section class="q-pb-none">
                <div class="section-header">
                  <q-icon name="medication" color="primary" size="24px" class="q-mr-sm" />
                  <div class="text-subtitle1 text-weight-bold text-primary">
                    SIGNOS
                  </div>
                </div>
              </q-card-section>

              <q-card-section>
                <ElementoClinicoResolucion v-model="res.signos" :opciones="opcionesSignos" :soloLectura="bloquearCampos"
                  class="elemento-clinico" />
              </q-card-section>
            </q-card>

            <!-- Síntomas -->
            <q-card class="form-section-card q-my-md">
              <q-card-section class="q-pb-none">
                <div class="section-header">
                  <q-icon name="sick" color="primary" size="24px" class="q-mr-sm" />
                  <div class="text-subtitle1 text-weight-bold text-primary">
                    SÍNTOMAS
                  </div>
                </div>
              </q-card-section>

              <q-card-section>
                <ElementoClinicoResolucion v-model="res.sintomas" :opciones="opcionesSintomas"
                  :soloLectura="bloquearCampos" class="elemento-clinico" />
              </q-card-section>
            </q-card>

            <!-- Síndromes -->
            <q-card class="form-section-card q-my-md">
              <q-card-section class="q-pb-none">
                <div class="section-header">
                  <q-icon name="science" color="primary" size="24px" class="q-mr-sm" />
                  <div class="text-subtitle1 text-weight-bold text-primary">
                    SÍNDROMES
                  </div>
                </div>
              </q-card-section>

              <q-card-section>
                <ElementoClinicoResolucion v-model="res.sindromes" :opciones="opcionesSindromes"
                  :soloLectura="bloquearCampos" tipo="sindrome" titulo="Síndromes" class="elemento-clinico" />
              </q-card-section>
            </q-card>

            <!-- Exámenes complementarios -->
            <q-card v-if="tieneExamenes" class="form-section-card q-my-md">
              <q-card-section class="q-pb-none">
                <div class="section-header">
                  <q-icon name="monitor_heart" color="primary" size="24px" class="q-mr-sm" />
                  <div class="text-subtitle1 text-weight-bold text-primary">
                    EXÁMENES COMPLEMENTARIOS
                  </div>
                </div>
              </q-card-section>

              <q-card-section>
                <!-- Botón para abrir el modal directamente -->
                <div class="row q-col-gutter-md q-mb-md">
                  <div class="col-12 col-md-8">
                    <q-btn color="primary" icon="add_circle" label="SELECCIONAR EXÁMENES" class="full-width"
                      :disable="bloquearCampos || examenesEnviados" @click="abrirModalExamenes" />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-btn color="secondary" icon="send" label="SOLICITAR EXÁMENES" class="full-width" :disable="!res.examenes.length ||
                      bloquearCampos ||
                      examenesEnviados
                      " @click="confirmarSolicitudExamenes" />
                  </div>
                </div>

                <!-- Exámenes seleccionados en diseño mejorado -->
                <div v-if="res.examenes.length > 0" class="q-mt-md">
                  <div class="row q-col-gutter-md">
                    <div v-for="(examen, index) in res.examenes" :key="index" class="col-12 col-sm-6 col-md-4 col-lg-3">
                      <div class="examen-tag q-mb-md" :class="{ 'examen-enviado': examenesEnviados }">
                        <div class="examen-tag-content">
                          <q-icon name="fact_check" color="primary" size="18px" class="q-mr-xs" />
                          <div class="examen-tag-text">{{ examen }}</div>
                        </div>
                        <q-btn v-if="!bloquearCampos && !examenesEnviados" round flat dense color="grey-7" icon="close"
                          size="xs" @click="eliminarExamen(index)" class="examen-tag-delete" />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Mensaje cuando no hay exámenes seleccionados -->
                <div v-else class="text-center text-grey q-py-md empty-state">
                  <q-icon name="assignment" size="40px" color="grey-5" class="q-mb-sm" />
                  <div class="text-body1">
                    No has seleccionado ningún examen complementario
                  </div>
                  <div class="text-caption text-grey">
                    Haz clic en "SELECCIONAR EXÁMENES" para añadir
                  </div>
                </div>

                <!-- Estado de exámenes enviados -->
                <div v-if="examenesEnviados" class="estado-examenes-solicitados q-mt-md">
                  <div class="text-center">
                    <q-icon name="check_circle" color="positive" size="32px" />
                    <div class="text-subtitle1 text-weight-bold text-positive q-mt-sm">
                      Exámenes solicitados correctamente
                    </div>

                    <!-- Nuevo botón para ver documentos en cualquier momento -->
                    <q-btn color="primary" icon="visibility" label="Ver documentos" class="q-mt-md q-mb-sm"
                      @click="mostrarExamenesDisponibles" />
                  </div>
                </div>
              </q-card-section>
            </q-card>
            <!-- DIAGNÓSTICO -->
            <q-card v-if="optionsDiagnosticos.length" class="form-section-card q-my-md">
              <q-card-section class="q-pb-none">
                <div class="section-header">
                  <q-icon name="medical_information" color="primary" size="24px" class="q-mr-sm" />
                  <div class="text-subtitle1 text-weight-bold text-primary">
                    DIAGNÓSTICO
                  </div>
                </div>
              </q-card-section>

              <q-card-section>
                <q-select filled v-model="res.diagnostico" :options="optionsDiagnosticos"
                  label="Seleccione un diagnóstico" :disable="bloquearCampos" :class="{
                    'campo-correcto': resultadoDiagnostico === 'correcto',
                    'campo-incorrecto': resultadoDiagnostico === 'incorrecto'
                  }">
                  <!-- Icono de estado -->
                  <template v-slot:append v-if="resultadoDiagnostico">
                    <q-icon :name="resultadoDiagnostico === 'correcto' ? 'check_circle' : 'error'"
                      :color="resultadoDiagnostico === 'correcto' ? 'positive' : 'negative'" size="24px" />
                  </template>
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey">
                        No hay resultados
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </q-card-section>
            </q-card>
            <!-- TRATAMIENTO -->
            <q-card v-if="comenzado && !bloqueado && tieneTratamientosDisponibles" class="form-section-card q-my-md">
              <q-card-section class="q-pb-none">
                <div class="section-header">
                  <q-icon name="healing" color="primary" size="24px" class="q-mr-sm" />
                  <div class="text-subtitle1 text-weight-bold text-primary">
                    TRATAMIENTO
                  </div>
                </div>
              </q-card-section>
              <q-card-section>
                <TratamientoResolucion ref="tratamientoResolucionRef" v-model="res.tratamientos"
                  :opciones-medicamentos="opcionesTratamientos.medicos" :opciones-dosis="opcionesTratamientos.dosis"
                  :opciones-frecuencia="opcionesTratamientos.frecuencias"
                  :opciones-duracion="opcionesTratamientos.duraciones" :soloLectura="bloquearCampos" />
              </q-card-section>
            </q-card>
            <!-- Debugging info para desarrollo (quitar en producción) -->
            <div v-if="false" class="q-pa-md text-caption bg-grey-2">
              Debug - Tratamientos: {{ tieneTratamientosDisponibles ? 'Disponibles' : 'No disponibles' }}
              <div v-if="caso.casoTratamientos">casoTratamientos: {{ caso.casoTratamientos.length }} items</div>
              <div>Opciones medicamentos: {{ opcionesTratamientos.medicos.length }} items</div>
            </div>
          </div>
        </q-card-section>

        <!-- Banner con nota final después de enviar -->
        <q-card-section v-if="enviado" class="q-pt-none">
          <q-banner class="bg-green-1 text-center q-my-md" rounded>
            <div class="text-h6 text-primary q-mb-xs">
              ¡Resolución enviada con éxito!
            </div>
            <div class="row items-center justify-center q-my-md">
              <q-circular-progress show-value font-size="20px" :value="puntuacionFinal" size="100px" :thickness="0.15"
                color="green" track-color="green-2" class="q-mr-md">
                <div class="text-green">{{ puntuacionFinal }}</div>
              </q-circular-progress>
              <div class="text-left q-ml-md">
                <div class="text-h5 text-green">Calificación</div>
                <div class="text-subtitle1 text-grey-8">sobre 100 puntos</div>
              </div>
            </div>
            <div class="q-mt-md">
              <q-btn color="primary" label="Ver detalles de la evaluación" outline icon="assessment"
                @click="mostrarResumen = true" class="q-mr-sm" />
              <q-btn color="deep-purple" label="Volver a la página principal" icon="home" @click="volverAIndice" />
            </div>
          </q-banner>
        </q-card-section>

        <!-- Botón enviar -->
        <q-card-section v-if="comenzado && !bloqueado" class="text-center q-pt-none q-pb-md">
          <q-btn size="lg" color="green" label="ENVIAR RESOLUCIÓN" icon="send" class="q-px-xl enviar-btn"
            :disable="enviado" @click="evaluar" />
        </q-card-section>
      </q-card>
    </div>

    <!-- MODALES -->

    <!-- Modal Historia Clínica -->
    <q-dialog v-model="modalHistoria" persistent>
      <q-card class="historia-modal">
        <q-card-section class="bg-gradient-primary text-white">
          <div class="text-h5 text-center">Historia Clínica</div>

          <!-- Solo mostrar temporizador si es tiempo limitado -->
          <div v-if="tipoLectura === 0" class="timer-container q-mt-md">
            <q-circular-progress :value="(relojHistoria /
              (caso.configuraciones?.[0]?.tiempo_vista_enunciado * 60 ||
                30)) *
              100
              " size="60px" :thickness="0.2" color="white" track-color="primary-7" class="q-mr-md">
              <q-icon name="schedule" size="24px" />
            </q-circular-progress>
            <div class="text-h5">
              {{ Math.floor(relojHistoria / 60) }}:{{
                String(Math.floor(relojHistoria % 60)).padStart(2, "0")
              }}
            </div>
          </div>
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <div class="text-body1 text-justify q-mb-md historia-content">
            {{ caso.enunciado }}
          </div>
        </q-card-section>

        <q-card-actions align="right" class="bg-grey-2 q-py-sm">
          <q-btn v-if="tipoLectura === 0" flat label="ENTENDIDO" color="deep-purple-7"
            @click="confirmarCerrarHistoria" />
          <q-btn v-else flat label="CERRAR" color="primary" @click="cerrarHistoria" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal confirmación cierre de historia -->
    <q-dialog v-model="modalConfirmacionCierre" persistent>
      <q-card class="confirmacion-modal">
        <q-card-section class="row items-center bg-warning text-white">
          <q-avatar icon="warning" color="white" text-color="warning" />
          <div class="text-h6 q-ml-md">¡Atención!</div>
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <p class="text-body1">
            ¿Estás seguro que deseas cerrar la historia clínica?
          </p>
          <p class="text-body1 text-weight-bold q-my-md">
            Este caso tiene tiempo limitado de lectura y no podrás volver a
            leerla.
          </p>
        </q-card-section>

        <q-card-actions align="right" class="bg-grey-2 q-py-sm">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn flat label="Sí, estoy seguro" color="negative" @click="cerrarHistoria" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal exámenes complementarios con scrollbar -->
    <q-dialog v-model="modalExamenes">
      <q-card class="examenes-modal">
        <q-card-section class="bg-gradient-primary text-white">
          <div class="text-h6">Exámenes complementarios disponibles</div>
        </q-card-section>

        <q-card-section class="q-py-md">
          <q-input outlined dense placeholder="Buscar exámenes..." v-model="busquedaExamen" class="q-mb-md">
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>

          <!-- Contenedor con scroll vertical -->
          <div class="examenes-lista-container">
            <q-list separator>
              <q-item v-for="examen in examenesDisponibles" :key="examen.id" clickable
                @click="seleccionarExamen(examen)" class="examen-item">
                <q-item-section avatar>
                  <q-avatar color="primary" text-color="white">
                    <q-icon name="fact_check" />
                  </q-avatar>
                </q-item-section>

                <q-item-section>
                  <q-item-label>{{ examen.nombre }}</q-item-label>
                  <q-item-label caption v-if="examen.archivo">
                    <q-badge outline color="teal">Documento disponible</q-badge>
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <div class="row items-center">
                    <q-btn v-if="examen.archivo" flat round color="primary" icon="visibility"
                      @click.stop="verArchivoExamen(examen)" />
                    <q-checkbox v-model="examenSeleccionado" :val="examen.nombre" @click.stop color="primary" />
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="bg-grey-2 q-py-sm">
          <q-btn flat label="Cerrar" color="grey-7" v-close-popup />
          <q-btn flat label="Añadir seleccionados" color="positive" @click="añadirExamenesSeleccionados"
            :disable="!examenSeleccionado.length" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal de confirmación para solicitar exámenes -->
    <q-dialog v-model="modalConfirmacionExamenes" persistent>
      <q-card class="confirmacion-examenes-modal">
        <q-card-section class="bg-gradient-secondary text-white">
          <div class="text-h6">Confirmar solicitud de exámenes</div>
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <p class="text-body1">
            Estás a punto de solicitar
            <strong>{{ res.examenes.length }}</strong> exámenes complementarios:
          </p>

          <q-list bordered separator class="rounded-borders q-my-md">
            <q-item v-for="(examen, index) in res.examenes" :key="index">
              <q-item-section avatar>
                <q-icon name="fact_check" color="secondary" />
              </q-item-section>
              <q-item-section>{{ examen }}</q-item-section>
            </q-item>
          </q-list>

          <p class="text-body2 text-weight-bold q-my-md">
            Una vez enviada la solicitud, no podrás modificar los exámenes
            seleccionados.
          </p>
        </q-card-section>

        <q-card-actions align="right" class="bg-grey-2 q-py-sm">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn flat label="Solicitar exámenes" color="secondary" @click="solicitarExamenes" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal resumen mejorado -->
    <q-dialog v-model="mostrarResumen">
      <q-card class="resumen-modal">
        <q-card-section class="bg-gradient-success text-white">
          <div class="text-h6">
            <q-icon name="assessment" class="q-mr-sm" />
            Detalles de tu evaluación
          </div>
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <div class="text-center q-mb-md">
            <div class="text-h3 text-primary">{{ puntuacionFinal }}</div>
            <div class="text-subtitle1 text-grey">Calificación final</div>
            <q-linear-progress :value="puntuacionFinal / 100" color="primary" class="q-mt-sm" size="10px" />
          </div>

          <q-separator class="q-my-md" />

          <q-list bordered separator class="rounded-borders">
            <q-expansion-item group="results" icon="contact_support" label="Motivos de consulta"
              header-class="text-primary text-weight-bold" default-opened>
              <q-card>
                <q-card-section>
                  <div class="row items-center q-mb-md">
                    <div class="col">
                      <div class="text-subtitle1 text-weight-medium">
                        Elementos seleccionados:
                      </div>
                      <div class="text-body2">
                        {{ res.motivos.join(", ") || "Ninguno seleccionado" }}
                      </div>
                    </div>
                    <div class="col-auto">
                      <q-badge color="positive" class="q-pa-xs">
                        <q-icon name="check" class="q-mr-xs" />{{
                          puntuacion?.detalle?.motivos?.correctos || 0
                        }}
                        correctos
                      </q-badge>
                      <q-badge color="negative" class="q-pa-xs q-ml-sm">
                        <q-icon name="close" class="q-mr-xs" />{{
                          puntuacion?.detalle?.motivos?.incorrectos || 0
                        }}
                        incorrectos
                      </q-badge>
                    </div>
                  </div>

                  <q-linear-progress :value="puntuacionMotivos / 100" color="primary" class="q-mt-sm" />
                  <div class="row justify-between q-mt-xs">
                    <div class="text-caption text-grey">
                      Puntuación: {{ puntuacionMotivos }}%
                    </div>
                    <div class="text-caption text-grey">
                      Peso en la nota final:
                      {{ (pesoMotivos * 100).toFixed(0) }}%
                    </div>
                  </div>

                  <div class="text-caption text-grey-8 q-mt-sm">
                    <q-icon name="info" size="xs" class="q-mr-xs" />
                    Se restaron
                    {{
                      Math.floor(
                        (puntuacion?.detalle?.motivos?.incorrectos || 0) / 2
                      )
                    }}
                    puntos correctos debido a errores.
                  </div>
                </q-card-section>
              </q-card>
            </q-expansion-item>

            <q-expansion-item group="results" icon="monitor_heart" label="Exámenes complementarios"
              header-class="text-primary text-weight-bold">
              <q-card>
                <q-card-section>
                  <div class="row items-center q-mb-md">
                    <div class="col">
                      <div class="text-subtitle1 text-weight-medium">
                        Elementos seleccionados:
                      </div>
                      <div class="text-body2">
                        {{ res.examenes.join(", ") || "Ninguno seleccionado" }}
                      </div>
                    </div>
                    <div class="col-auto">
                      <q-badge color="positive" class="q-pa-xs">
                        <q-icon name="check" class="q-mr-xs" />{{
                          puntuacion?.detalle?.examenes?.correctos || 0
                        }}
                        correctos
                      </q-badge>
                      <q-badge color="negative" class="q-pa-xs q-ml-sm">
                        <q-icon name="close" class="q-mr-xs" />{{
                          puntuacion?.detalle?.examenes?.incorrectos || 0
                        }}
                        incorrectos
                      </q-badge>
                    </div>
                  </div>

                  <q-linear-progress :value="puntuacionExamenes / 100" color="primary" class="q-mt-sm" />
                  <div class="row justify-between q-mt-xs">
                    <div class="text-caption text-grey">
                      Puntuación: {{ puntuacionExamenes }}%
                    </div>
                    <div class="text-caption text-grey">
                      Peso en la nota final:
                      {{ (pesoExamenes * 100).toFixed(0) }}%
                    </div>
                  </div>

                  <div class="text-caption text-grey-8 q-mt-sm">
                    <q-icon name="info" size="xs" class="q-mr-xs" />
                    Se restaron
                    {{
                      Math.floor(
                        (puntuacion?.detalle?.examenes?.incorrectos || 0) / 2
                      )
                    }}
                    puntos correctos debido a errores.
                  </div>
                </q-card-section>
              </q-card>
            </q-expansion-item>

            <q-expansion-item group="results" icon="medication" label="Elementos clínicos"
              header-class="text-primary text-weight-bold">
              <q-card>
                <q-card-section>
                  <div class="row items-center q-mb-md">
                    <div class="col">
                      <div class="text-subtitle1 text-weight-medium">
                        Elementos clínicos evaluados:
                      </div>
                      <div class="text-body2">Signos, Síntomas y Síndromes</div>
                    </div>
                    <div class="col-auto">
                      <q-badge color="positive" class="q-pa-xs">
                        <q-icon name="check" class="q-mr-xs" />{{
                          puntuacion?.detalle?.elementos_clinicos?.correctos ||
                          0
                        }}
                        correctos
                      </q-badge>
                      <q-badge color="negative" class="q-pa-xs q-ml-sm">
                        <q-icon name="close" class="q-mr-xs" />{{
                          puntuacion?.detalle?.elementos_clinicos
                            ?.incorrectos || 0
                        }}
                        incorrectos
                      </q-badge>
                    </div>
                  </div>

                  <q-linear-progress :value="puntuacionElementos / 100" color="primary" class="q-mt-sm" />
                  <div class="row justify-between q-mt-xs">
                    <div class="text-caption text-grey">
                      Puntuación: {{ puntuacionElementos }}%
                    </div>
                    <div class="text-caption text-grey">
                      Peso en la nota final:
                      {{ (pesoElementos * 100).toFixed(0) }}%
                    </div>
                  </div>

                  <div class="text-caption text-grey-8 q-mt-sm">
                    <q-icon name="info" size="xs" class="q-mr-xs" />
                    Se restaron
                    {{
                      Math.floor(
                        (puntuacion?.detalle?.elementos_clinicos?.incorrectos ||
                          0) / 2
                      )
                    }}
                    puntos correctos debido a errores.
                  </div>
                  <div class="text-caption text-grey-8 q-mt-sm">
                    <q-icon name="info" size="xs" class="q-mr-xs" />
                    <strong>Importante:</strong> Para que un elemento clínico se
                    considere correcto, todos sus campos (manifestación, tipo,
                    características, localización) deben estar correctos. En
                    esta sección no se aplica la regla de resta por respuestas
                    incorrectas.
                  </div>
                </q-card-section>
              </q-card>
            </q-expansion-item>

            <q-expansion-item v-if="puntuacionDiagnostico > 0 || pesoDiagnostico > 0" group="results"
              icon="medical_information" label="Diagnóstico" header-class="text-primary text-weight-bold">
              <q-card>
                <q-card-section>
                  <div class="row items-center q-mb-md">
                    <div class="col">
                      <div class="text-subtitle1 text-weight-medium">
                        Diagnóstico seleccionado:
                      </div>
                      <div class="text-body2">
                        {{ typeof res.diagnostico === 'object' ?
                          (res.diagnostico.label || res.diagnostico.value) :
                          res.diagnostico || "Ninguno seleccionado" }}
                      </div>
                    </div>
                    <div class="col-auto">
                      <q-badge :color="puntuacionDiagnostico === 100 ? 'positive' : 'negative'" class="q-pa-xs">
                        <q-icon :name="puntuacionDiagnostico === 100 ? 'check' : 'close'" class="q-mr-xs" />
                        {{ puntuacionDiagnostico === 100 ? 'Correcto' : 'Incorrecto' }}
                      </q-badge>
                    </div>
                  </div>

                  <q-linear-progress :value="puntuacionDiagnostico / 100" color="primary" class="q-mt-sm" />
                  <div class="row justify-between q-mt-xs">
                    <div class="text-caption text-grey">
                      Puntuación: {{ puntuacionDiagnostico }}%
                    </div>
                    <div class="text-caption text-grey">
                      Peso en la nota final: {{ (pesoDiagnostico * 100).toFixed(0) }}%
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </q-expansion-item>

            <!-- Sección de tratamientos en el modal de resumen -->
            <q-expansion-item v-if="tieneTratamientosDisponibles" group="results" icon="healing" label="Tratamientos"
              header-class="text-primary text-weight-bold">
              <q-card>
                <q-card-section>
                  <div class="row items-center q-mb-md">
                    <div class="col">
                      <div class="text-subtitle1 text-weight-medium">
                        Tratamientos evaluados:
                      </div>
                      <div class="text-body2">
                        {{res.tratamientos.filter(t => t.medicamento).length || 0}} tratamientos seleccionados
                      </div>
                    </div>
                    <div class="col-auto">
                      <q-badge color="positive" class="q-pa-xs">
                        <q-icon name="check" class="q-mr-xs" />
                        {{ puntuacion?.detalle?.tratamientos?.correctos || 0 }} correctos
                      </q-badge>
                      <q-badge color="negative" class="q-pa-xs q-ml-sm">
                        <q-icon name="close" class="q-mr-xs" />
                        {{ puntuacion?.detalle?.tratamientos?.incorrectos || 0 }} incorrectos
                      </q-badge>
                    </div>
                  </div>

                  <q-linear-progress :value="puntuacionTratamientos / 100" color="primary" class="q-mt-sm" />
                  <div class="row justify-between q-mt-xs">
                    <div class="text-caption text-grey">
                      Puntuación: {{ puntuacionTratamientos }}%
                    </div>
                    <div class="text-caption text-grey">
                      Peso en la nota final: {{ (pesoTratamientos * 100).toFixed(0) }}%
                    </div>
                  </div>

                  <div class="text-caption text-grey-8 q-mt-sm">
                    <q-icon name="info" size="xs" class="q-mr-xs" />
                    <strong>Importante:</strong> Para que un tratamiento se considere correcto, todos sus campos
                    (medicamento, dosis, frecuencia, duración) deben estar correctos.
                  </div>
                </q-card-section>
              </q-card>
            </q-expansion-item>

          </q-list>

          <div class="text-center q-mt-lg">
            <q-icon name="school" color="primary" size="48px" class="pulse-success" />
            <div class="text-h6 text-primary q-mt-sm">
              ¡Evaluación completada!
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="bg-grey-2 q-py-sm">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
          <q-btn color="deep-purple" label="Volver a la página principal" icon="home" @click="volverAIndice" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal para examenes disponibles -->
    <q-dialog v-model="modalExamenesDisponibles">
      <q-card class="examenes-disponibles-modal">
        <q-card-section class="bg-gradient-primary text-white">
          <div class="text-h6">Documentos disponibles</div>
        </q-card-section>

        <q-card-section class="q-pa-md">
          <p class="text-body1 q-mb-md">
            Los siguientes documentos están disponibles para visualizar:
          </p>

          <q-list bordered separator class="rounded-borders">
            <q-item v-for="(examen, index) in examenesParaMostrar" :key="index" clickable
              @click="abrirArchivoExamen(examen)" class="q-my-xs">
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white">
                  <q-icon name="description" />
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label>{{ examen.nombre }}</q-item-label>
                <q-item-label caption>Haga clic para abrir</q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-btn flat round color="primary" icon="open_in_new" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right" class="bg-grey-2 q-py-sm">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import { useQuasar } from "quasar";
import { watch } from "vue";
import { api, STORAGE_URL } from "boot/axios";
import { useRoute, useRouter } from "vue-router";
import ElementoClinicoResolucion from "src/components/forms/ElementoClinicoResolucion.vue";
import TratamientoResolucion from 'src/components/forms/TratamientoResolucion.vue'

const cargandoCaso = ref(false)
const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const caso = reactive({});
const motivoConsultas = ref([]);
const examenes = ref([]);
const presentas = reactive({
  tipo1: [],
  tipo2: [],
  tipo3: [],
});
const casoId = ref(route.query.id);
const opcionesSignos = ref({});
const opcionesSintomas = ref({});
const opcionesSindromes = ref({});

const res = reactive({
  motivos: [],
  signos: [],
  sintomas: [],
  sindromes: [],
  examenes: [],
  diagnostico: null,
});

const opcionesTratamientos = reactive({
  medicos: [],
  dosis: [],
  frecuencias: [],
  duraciones: []
});

// Variable para almacenar toda la información de puntuación
const puntuacion = ref(null);

// Variables para el control de exámenes
const examenesDisponibles = ref([]);
const examenSeleccionado = ref([]);
const modalExamenes = ref(false);
const busquedaExamen = ref(""); // Nueva variable para búsqueda

// Variables para la solicitud de exámenes
const examenesEnviados = ref(false);
const modalConfirmacionExamenes = ref(false);

// Variables para control de flujo
const modalHistoria = ref(false);
const modalConfirmacionCierre = ref(false);
const bloquearCampos = ref(false);
const bloqueado = ref(false);
const mostrarResumen = ref(false);
const enviado = ref(false);
const comenzado = ref(false);

const relojHistoria = ref(0);
const relojResolucion = ref(0);
let intervaloHistoria = null;
let intervaloResolucion = null;

// Tipo de lectura (0 = limitado, 1 = ilimitado)
const tipoLectura = computed(() => {
  return caso.configuraciones?.[0]?.tipo || 0;
});

const porcentajeTiempo = computed(() => {
  if (!caso.configuraciones?.length) return 0;
  return (
    (relojResolucion.value / (caso.configuraciones[0].tiempo_resolucion * 60)) *
    100
  );
});

const colorTiempo = computed(() => {
  if (porcentajeTiempo.value > 70) return "green";
  if (porcentajeTiempo.value > 30) return "amber";
  return "red";
});

// Variables para la puntuación
const puntuacionFinal = ref(0);
const puntuacionMotivos = ref(0);
const puntuacionElementos = ref(0);
const puntuacionExamenes = ref(0);
const pesoMotivos = ref(0);
const pesoElementos = ref(0);
const pesoExamenes = ref(0);

const modalExamenesDisponibles = ref(false);
const examenesParaMostrar = ref([]);
const examenesDisponiblesGuardados = ref([]);

const tieneExamenes = ref(false);

const evaluacionId = ref(null);
const evaluacionData = ref(null);

const optionsDiagnosticos = ref([]);

// Variables para el diagnóstico
const resultadoDiagnostico = ref(null); // Almacenará 'correcto' o 'incorrecto'
const puntuacionDiagnostico = ref(0);
const pesoDiagnostico = ref(0);

// Variables para tratamientos
const puntuacionTratamientos = ref(0);
const pesoTratamientos = ref(0);
const tratamientoResolucionRef = ref(null); // Referencia al componente de tratamientos

function prepararTratamientosParaEnvio() {
  if (!res.tratamientos || !Array.isArray(res.tratamientos)) {
    return [];
  }

  return res.tratamientos
    .filter(t => t.medicamento)
    .map(t => ({
      // Only send the ID or value, not the full object
      medicamento_id: extraerID(t.medicamento),
      dosis_id: extraerID(t.dosis),
      frecuencia_id: extraerID(t.frecuencia),
      duracion_id: extraerID(t.duracion),
      seleccionado: true,
      observaciones: t.observaciones || ''
    }));
}

// Función auxiliar para extraer IDs
function extraerID(campo) {
  if (!campo) return null;

  // Si es un valor numérico directo
  if (typeof campo === 'number') return campo;

  // Si es un string que parece un número
  if (typeof campo === 'string' && /^\d+$/.test(campo)) {
    return parseInt(campo);
  }

  // Si es un objeto (como {label: "X", value: 1})
  if (typeof campo === 'object') {
    if (campo.id !== undefined) return campo.id;
    if (campo.value !== undefined) return campo.value;
  }

  // Si no podemos extraer un ID, devolver el campo como está
  return campo;
}

// Determinar si hay tratamientos disponibles para este caso
const tieneTratamientosDisponibles = computed(() => {
  // 1. Verificar si hay opciones de tratamientos disponibles
  const hayOpciones = opcionesTratamientos.medicos.length > 0;

  // 2. Verificar si el caso tiene tratamientos definidos
  const hayTratamientosCaso = caso.casoTratamientos?.length > 0;

  // 3. Verificar si hay tratamientos correctos
  const hayTratamientosCorrectos = caso.tratamientos_correctos?.length > 0;

  // 4. Verificar si hay tratamientos en res
  const hayTratamientosRes = Array.isArray(res.tratamientos) && res.tratamientos.length > 0;

  console.log("Verificación de tratamientos:", {
    hayOpciones,
    hayTratamientosCaso,
    hayTratamientosCorrectos,
    hayTratamientosRes,
    opcionesMedicos: opcionesTratamientos.medicos,
    casoTratamientos: caso.casoTratamientos,
    tratamientosCorrectos: caso.tratamientos_correctos,
    resTratamientos: res.tratamientos
  });

  // Retornar true si hay opciones Y al menos una de las otras condiciones es verdadera
  return hayOpciones && (hayTratamientosCaso || hayTratamientosCorrectos || hayTratamientosRes);
});

// Añadir esta función a la sección de tus funciones "preparar... ParaEnvio"
function prepararDiagnosticoParaEnvio() {
  if (!res.diagnostico) return null;

  if (typeof res.diagnostico === 'object') {
    // Make sure to return just a string or number, not the whole object
    if (res.diagnostico.value !== undefined) return res.diagnostico.value;
    if (res.diagnostico.id !== undefined) return res.diagnostico.id;
    if (res.diagnostico.label !== undefined) return res.diagnostico.label;

    // Last resort - stringify the object
    return JSON.stringify(res.diagnostico);
  }

  return res.diagnostico;
}

function mostrarResumenConPuntuacion(puntuacionData) {
  // Guardar la información completa
  puntuacion.value = puntuacionData;

  // Actualizar las variables reactivas
  puntuacionFinal.value = puntuacionData.nota_final;
  puntuacionMotivos.value = puntuacionData.detalle.motivos.porcentaje;
  puntuacionElementos.value =
    puntuacionData.detalle.elementos_clinicos.porcentaje;
  puntuacionExamenes.value = puntuacionData.detalle.examenes.porcentaje;

  // AÑADIR: Actualizar puntuación y peso del diagnóstico
  puntuacionDiagnostico.value = puntuacionData.detalle.diagnostico?.porcentaje || 0;
  puntuacionTratamientos.value = puntuacionData.detalle.tratamientos?.porcentaje || 0;
  pesoDiagnostico.value = puntuacionData.detalle.diagnostico?.peso || 0;
  pesoTratamientos.value = puntuacionData.detalle.tratamientos?.peso || 0;
  pesoMotivos.value = puntuacionData.detalle.motivos.peso;
  pesoElementos.value = puntuacionData.detalle.elementos_clinicos.peso;
  pesoExamenes.value = puntuacionData.detalle.examenes.peso;

  // Mostrar el modal
  mostrarResumen.value = true;
}

watch(busquedaExamen, () => {
  filtrarExamenes();
});

onMounted(() => {
  console.log("Route query params:", route.query);
  console.log("ID del caso:", route.query.id);
  console.log("ID de evaluación:", route.query.evaluacion);

  // Asignar el ID del caso y de la evaluación
  casoId.value = route.query.id;
  evaluacionId.value = route.query.evaluacion || null;

  // Si tenemos ID de evaluación, priorizar cargar por evaluación
  if (evaluacionId.value) {
    console.log("Este caso se está resolviendo como parte de una evaluación");
    cargarDatosEvaluacion();
  }
  // Si solo tenemos caso y no evaluación, cargar directamente el caso
  else if (casoId.value) {
    cargarCaso();
  }
  else {
    console.error("No se encontró el ID del caso en la URL");
    $q.notify({
      type: "negative",
      message: "Error al identificar el caso clínico",
      position: "top",
      icon: "error",
      timeout: 3000,
    });
  }

  // Si estamos en modo evaluación, prevenir la navegación hacia atrás
  if (evaluacionId.value) {
    // Prevenir el uso del botón atrás del navegador
    window.history.pushState(null, "", window.location.href);

    window.addEventListener("popstate", function (event) {
      window.history.pushState(null, "", window.location.href);

      // Mostrar aviso
      $q.dialog({
        title: 'No puedes volver atrás',
        message: 'Debes completar esta evaluación. Si abandonas, se calificará con 0 puntos.',
        persistent: true,
        ok: {
          color: 'primary',
          label: 'Entendido'
        }
      });
    });

    // También advertir si intenta cerrar la ventana o navegar a otra URL
    window.addEventListener('beforeunload', function (e) {
      // Mensaje que se mostrará (los navegadores modernos pueden mostrar un mensaje genérico)
      const mensaje = 'Si abandonas esta página, tu evaluación se calificará con 0 puntos. ¿Estás seguro?';
      e.returnValue = mensaje;
      return mensaje;
    });
  }
});

// Función para verificar si el usuario está intentando navegar mientras está en modo evaluación
function verificarNavegacion(to, from, next) {
  if (evaluacionId.value && !resolucionCompletada.value) {
    // Mostrar diálogo de confirmación
    $q.dialog({
      title: 'Advertencia',
      message: 'Si abandonas la evaluación ahora, se calificará con 0 puntos. ¿Estás seguro?',
      persistent: true,
      ok: {
        color: 'negative',
        label: 'Sí, abandonar (0 puntos)'
      },
      cancel: {
        color: 'primary',
        label: 'No, continuar evaluación'
      }
    }).onOk(() => {
      // El usuario eligió abandonar, enviar resolución con 0 puntos
      enviarResolucionIncompleta().then(() => {
        next(); // Permitir la navegación
      }).catch(() => {
        next(false); // Prevenir la navegación si hay error
      });
    }).onCancel(() => {
      next(false); // Prevenir la navegación
    });
  } else {
    // No estamos en evaluación o ya completó, permitir la navegación
    next();
  }
}

// Función para enviar una resolución incompleta con 0 puntos
async function enviarResolucionIncompleta() {
  try {
    // Enviar una resolución vacía o con mínimos datos para registrar el intento
    await api.post('/resoluciones', {
      caso_id: casoId.value,
      estudiante_id: userId, // Asegúrate de tener el ID del estudiante
      evaluacion_id: evaluacionId.value,
      motivos: [], // Sin motivos seleccionados
      elementos_clinicos: { signos: [], sintomas: [], sindromes: [] },
      examenes: []
    });

    // Marcar como completada la evaluación (con 0 puntos)
    await api.post(`/evaluaciones/${evaluacionId.value}/marcar-completada`, {
      resolucion_id: 0 // ID ficticio o el que devuelva la creación de la resolución
    });

    $q.notify({
      message: 'Has abandonado la evaluación. Tu calificación será 0.',
      color: 'negative',
      position: 'top',
      timeout: 3000
    });

    return true;
  } catch (error) {
    console.error('Error al registrar abandono:', error);
    $q.notify({
      message: 'Error al registrar el abandono de la evaluación',
      color: 'negative',
      position: 'top',
      timeout: 3000
    });
    return false;
  }
}

async function cargarDatosEvaluacion() {
  if (!evaluacionId.value) return;
  cargandoCaso.value = true;
  try {
    const { data } = await api.get(`/evaluaciones/${evaluacionId.value}/caso`);
    evaluacionData.value = data.evaluacion;

    // 1) Actualiza sólo el ID de caso
    casoId.value = data.caso.id;

    // 2) Vuelve a cargar TODO el detalle del caso
    await cargarCaso();

  } catch (error) {
    console.error("Error al cargar datos de la evaluación:", error);
    $q.notify({
      type: "negative",
      message: "Error al cargar datos de la evaluación",
      position: "top",
      timeout: 3000,
    });
  } finally {
    cargandoCaso.value = false;
  }
}

async function cargarCaso() {
  try {
    console.log("Cargando caso con ID:", casoId.value);

    if (!casoId.value) {
      $q.notify({
        type: "negative",
        message: "No se pudo identificar el caso clínico",
        position: "top",
        icon: "error",
        timeout: 3000,
      });
      return;
    }

    const { data } = await api.get(`/casos/${casoId.value}/detalle-completo`);
    console.log("Datos recibidos del backend:", data);
    console.log("Tratamientos del caso:", data.caso.casoTratamientos);
    console.log("Opciones de tratamientos:", data.opciones_tratamientos);
    Object.assign(caso, data.caso);

    // Asignar tratamientos al modelo reactivo para que se muestren y se califiquen
    if (data.caso.casoTratamientos && Array.isArray(data.caso.casoTratamientos)) {
      res.tratamientos = data.caso.casoTratamientos.map(t => ({
        medicamento: t.medicamento || null,
        dosis: t.dosis || null,
        frecuencia: t.frecuencia || null,
        duracion: t.duracion || null,
        estados: { medicamento: null, dosis: null, frecuencia: null, duracion: null }
      }));
    } else if (data.caso.tratamientos_correctos && Array.isArray(data.caso.tratamientos_correctos)) {
      res.tratamientos = data.caso.tratamientos_correctos.map(t => ({
        medicamento: t.medicamento || null,
        dosis: t.dosis || null,
        frecuencia: t.frecuencia || null,
        duracion: t.duracion || null,
        estados: { medicamento: null, dosis: null, frecuencia: null, duracion: null }
      }));
    } else {
      // Inicializar con al menos un tratamiento vacío
      res.tratamientos = [{
        medicamento: null,
        dosis: null,
        frecuencia: null,
        duracion: null,
        estados: { medicamento: null, dosis: null, frecuencia: null, duracion: null }
      }];
    }

    // Asegurar que las opciones de tratamientos estén disponibles
    if (data.opciones_tratamientos) {
      opcionesTratamientos.medicos = data.opciones_tratamientos.medicamentos || [];
      opcionesTratamientos.dosis = data.opciones_tratamientos.dosis || [];
      opcionesTratamientos.frecuencias = data.opciones_tratamientos.frecuencias || [];
      opcionesTratamientos.duraciones = data.opciones_tratamientos.duraciones || [];

      console.log("Opciones de tratamientos cargadas:", {
        medicamentos: opcionesTratamientos.medicos.length,
        dosis: opcionesTratamientos.dosis.length,
        frecuencias: opcionesTratamientos.frecuencias.length,
        duraciones: opcionesTratamientos.duraciones.length
      });
    }

    // Verificación explícita de existencia de tratamientos
    console.log("Verificando tratamientos:", {
      casoTratamientos: caso.casoTratamientos,
      tratamientosEstudiante: res.tratamientos,
      opcionesTratamientos: opcionesTratamientos
    });

    const respDiag = await api.get(`/casos/${casoId.value}/diagnosticos`);
    optionsDiagnosticos.value = respDiag.data.diagnosticos;
    // Usa los nombres reales del backend
    motivoConsultas.value = data.motivoConsultas_estudiante;
    examenes.value = data.examenes_estudiante;
    examenesDisponibles.value = data.examenes_estudiante;

    // Verificar si hay exámenes disponibles
    console.log("Exámenes disponibles:", examenes.value);
    tieneExamenes.value =
      Array.isArray(examenes.value) && examenes.value.length > 0;
    console.log("¿Tiene exámenes?:", tieneExamenes.value);

    // Si existe la estructura de presentas_estudiante (para compatibilidad)
    if (data.presentas_estudiante) {
      Object.assign(presentas, data.presentas_estudiante);
    }

    // Usar las opciones que vienen del backend para cada tipo
    if (data.opciones) {
      opcionesSignos.value = data.opciones.signos || {};
      opcionesSintomas.value = data.opciones.sintomas || {};
      opcionesSindromes.value = data.opciones.sindromes || {};
    } else {
      // Fallback al método anterior si no vienen las opciones
      opcionesSignos.value = crearOpcionesDesdePresentas(presentas.tipo1);
      opcionesSintomas.value = crearOpcionesDesdePresentas(presentas.tipo2);
      opcionesSindromes.value = crearOpcionesDesdePresentas(presentas.tipo3);
    }

    console.log("Opciones cargadas:", {
      signos: opcionesSignos.value,
      sintomas: opcionesSintomas.value,
      sindromes: opcionesSindromes.value,
    });
  } catch (error) {
    console.error("Error cargando el caso:", error);
    $q.notify({
      type: "negative",
      message: "Error al cargar el caso clínico",
      position: "top",
      icon: "error",
      timeout: 3000,
    });
  }
}

// Función para abrir el modal de confirmación
function confirmarSolicitudExamenes() {
  if (res.examenes.length === 0) {
    $q.notify({
      message: "Debes seleccionar al menos un examen para solicitar",
      color: "warning",
      icon: "warning",
      position: "top",
      timeout: 2000,
    });
    return;
  }

  modalConfirmacionExamenes.value = true;
}

async function solicitarExamenes() {
  try {
    // Cierra el modal de confirmación
    modalConfirmacionExamenes.value = false;

    // Llama al backend
    const { data } = await api.post(`/casos/${casoId.value}/solicitar-examenes`, {
      examenes: res.examenes,
    });

    // Marca los exámenes como enviados
    examenesEnviados.value = true;

    // Guardar referencia a los exámenes disponibles
    if (data.examenesDisponibles && data.examenesDisponibles.length > 0) {
      examenesDisponiblesGuardados.value = data.examenesDisponibles;
    }

    // Notificación de éxito
    $q.notify({
      message: `Has solicitado ${res.examenes.length} exámenes complementarios`,
      color: "positive",
      icon: "check_circle",
      position: "top",
      timeout: 3000,
    });

    // Si hay documentos, mostrar el modal después de un pequeño retraso
    setTimeout(() => {
      if (data.examenesDisponibles && data.examenesDisponibles.length > 0) {
        abrirExamenesDisponibles(data.examenesDisponibles);
      }
    }, 1000);
  } catch (error) {
    console.error("Error al solicitar exámenes:", error);
    $q.notify({
      message: "Error al procesar la solicitud de exámenes",
      color: "negative",
      icon: "error",
      position: "top",
      timeout: 3000,
    });
  }
}

// Funciones para manejar exámenes
function abrirExamenesDisponibles(examenes) {
  // Filtrar solo los que tienen archivos
  const examenesConArchivo = examenes.filter(
    (examen) => examen.archivo && examen.archivo.trim() !== ""
  );

  if (examenesConArchivo.length === 0) {
    $q.notify({
      message: "No hay archivos disponibles para mostrar",
      color: "warning",
      icon: "warning",
      position: "top",
      timeout: 3000,
    });
    return;
  }

  // Guardar los exámenes disponibles para acceso posterior
  examenesParaMostrar.value = examenesConArchivo;
  examenesDisponiblesGuardados.value = examenesConArchivo;

  // Siempre mostrar el modal, incluso si hay un solo documento
  modalExamenesDisponibles.value = true;
}

// Nueva función para mostrar exámenes ya solicitados
function mostrarExamenesDisponibles() {
  if (examenesDisponiblesGuardados.value.length === 0) {
    $q.notify({
      message: "No hay documentos disponibles",
      color: "warning",
      icon: "warning",
      position: "top",
      timeout: 2000,
    });
    return;
  }

  examenesParaMostrar.value = examenesDisponiblesGuardados.value;
  modalExamenesDisponibles.value = true;
}

function abrirArchivoExamen(examen) {
  if (examen.archivo) {
    const url = `${STORAGE_URL}/${examen.archivo}`;
    window.open(url, "_blank");
  }
}

// Nuevo método específico para mostrar el diálogo
function mostrarDialogoExamenesDisponibles(examenes) {
  // Crear contenido HTML para el diálogo
  let contenidoHtml = `
    <div class="q-pa-md">
      <div class="text-h6 q-mb-md">Documentos disponibles (${examenes.length})</div>
      <div class="q-gutter-y-md">
  `;

  examenes.forEach((examen, index) => {
    contenidoHtml += `
      <q-item clickable class="bg-blue-1 rounded-borders"
              onclick="window.open('${STORAGE_URL}/${examen.archivo}', '_blank')">
        <q-item-section avatar>
          <q-icon name="description" color="primary" />
        </q-item-section>
        <q-item-section>
          <q-item-label>${examen.nombre}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn flat round color="primary" icon="open_in_new" />
        </q-item-section>
      </q-item>
    `;
  });

  contenidoHtml += `
      </div>
    </div>
  `;

  // Mostrar el diálogo
  $q.dialog({
    title: "Exámenes complementarios",
    message: contenidoHtml,
    html: true,
    persistent: true,
    style: "min-width: 300px",
    ok: "Cerrar",
  });
}

function crearOpcionesDesdePresentas(lista) {
  const arr = Array.isArray(lista) ? lista : [];
  return {
    manifestaciones: arr.map((p) => p.nombreManifestacion || ""),
    caracteristicas: [], // Aquí cargaríamos desde la DB
    parametros: [], // Aquí cargaríamos desde la DB
    localizacion: [], // Aquí cargaríamos desde la DB
  };
}

function iniciarResolucion() {
  comenzado.value = true;
  modalHistoria.value = true;

  // Configuramos el tiempo de lectura del enunciado
  relojHistoria.value =
    caso.configuraciones?.[0]?.tiempo_vista_enunciado * 60 || 30;

  // Iniciamos el temporizador para la historia clínica
  if (tipoLectura.value === 0) {
    // Solo si es tiempo limitado (tipo 0)
    intervaloHistoria = setInterval(() => {
      relojHistoria.value--;
      if (relojHistoria.value <= 0) {
        clearInterval(intervaloHistoria);
        cerrarHistoria();
      }
    }, 1000);
  }
}

function confirmarCerrarHistoria() {
  // Solo mostramos confirmación si el tipo de lectura es limitado (0)
  if (tipoLectura.value === 0) {
    modalConfirmacionCierre.value = true;
  } else {
    cerrarHistoria();
  }
}

function cerrarHistoria() {
  modalHistoria.value = false;
  modalConfirmacionCierre.value = false;

  // Limpiamos el intervalo de la historia si existe
  if (intervaloHistoria) {
    clearInterval(intervaloHistoria);
    intervaloHistoria = null;
  }

  // Solo iniciamos el tiempo de resolución si aún no se ha iniciado
  if (!intervaloResolucion) {
    // Iniciamos el tiempo de resolución
    relojResolucion.value =
      caso.configuraciones?.[0]?.tiempo_resolucion * 60 || 600;

    // Iniciamos el temporizador para la resolución
    intervaloResolucion = setInterval(() => {
      relojResolucion.value--;
      if (relojResolucion.value <= 0) {
        clearInterval(intervaloResolucion);
        finalizarResolucion();
      }
    }, 1000);
  }
}

function finalizarResolucion() {
  bloquearCampos.value = true;
  bloqueado.value = true;
  evaluar();
  $q.notify({
    type: "negative",
    message: "⛔ Tiempo finalizado. Tu resolución fue enviada.",
    position: "top",
    icon: "timer_off",
    timeout: 5000,
  });
}

async function evaluar() {
  if (enviado.value) return;

  // Mostrar diálogo de confirmación antes de enviar
  $q.dialog({
    title: "¡Atención!",
    message: "¿Estás seguro de enviar tu resolución?",
    html: true,
    class: "confirmacion-envio",
    persistent: true,
    ok: {
      label: "Sí, enviar",
      color: "positive",
      icon: "send",
    },
    cancel: {
      label: "Cancelar",
      color: "negative",
      icon: "close",
    },
    dark: false,
    cardStyle: {
      maxWidth: "450px",
      borderRadius: "10px",
    },
  }).onOk(async () => {
    // Continuar con el envío solo si el usuario confirma
    try {
      // Detenemos todos los intervalos de tiempo
      if (intervaloResolucion) {
        clearInterval(intervaloResolucion);
        intervaloResolucion = null;
      }

      // Obtener el ID del estudiante del localStorage
      const estudianteId = localStorage.getItem("estudiante_id");

      // Preparamos los datos a enviar al backend
      const datosResolucion = {
        caso_id: casoId.value,
        estudiante_id: estudianteId,
        motivos: prepararMotivosParaEnvio(),
        elementos_clinicos: prepararElementosClinicosParaEnvio(),
        examenes: prepararExamenesParaEnvio(),
        diagnostico: prepararDiagnosticoParaEnvio(), // Añadir esta línea
        tratamientos: prepararTratamientosParaEnvio(), // Añadir esta línea
      };

      // Si existe un ID de evaluación, lo añadimos
      if (evaluacionId.value) {
        datosResolucion.evaluacion_id = evaluacionId.value;
      }

      // Mostrar un indicador de carga
      $q.loading.show({
        message: "Enviando tu resolución...",
      });

      // Enviamos los datos al backend
      const { data } = await api.post("/resoluciones", datosResolucion);

      // Ocultar el indicador de carga
      $q.loading.hide();

      // Marcamos como enviado
      enviado.value = true;
      bloquearCampos.value = true;

      // Actualizamos las UI con las respuestas correctas/incorrectas
      marcarRespuestasCorrectas(data.resultados);

      // Mostramos el resumen con la puntuación
      mostrarResumenConPuntuacion(data.puntuacion);

      // Notificación de éxito
      $q.notify({
        message: `Resolución enviada correctamente. Nota final: ${data.puntuacion.nota_final}`,
        color: "positive",
        icon: "check_circle",
        position: "top",
        timeout: 3000,
      });

      // Destacar visualmente las secciones según su puntuación
      destacarSeccionesPorPuntuacion(data.puntuacion);

      // Si venía de una evaluación, notificar al usuario
      if (evaluacionId.value) {
        setTimeout(() => {
          $q.notify({
            message: "Esta resolución forma parte de una evaluación y ha sido registrada correctamente",
            color: "deep-purple",
            icon: "school",
            position: "top",
            timeout: 4000,
          });
        }, 1000);
      }

    } catch (error) {
      $q.loading.hide();
      console.error("Error al evaluar la resolución:", error);
      $q.notify({
        message: "Error al procesar la evaluación",
        color: "negative",
        icon: "error",
        position: "top",
        timeout: 3000,
      });
    }
  });
}

// Modificar la función volverAIndice para manejar el caso de venir de una evaluación
function volverAIndice() {
  // Si venía de una evaluación, redirigir a la página de evaluaciones pendientes
  if (evaluacionId.value) {
    router.push({ name: 'evaluaciones-pendientes' });
  } else {
    // Caso regular: navegar al índice
    router.push({ name: "index" });
  }
}

function destacarSeccionesPorPuntuacion(puntuacion) {
  // Función auxiliar para aplicar estilos según porcentaje
  const aplicarEstilos = (elemento, porcentaje) => {
    if (!elemento) return;

    if (porcentaje >= 70) {
      elemento.style.borderLeft = "5px solid #4caf50";
      elemento.style.boxShadow = "0 4px 8px rgba(76, 175, 80, 0.2)";
    } else if (porcentaje >= 40) {
      elemento.style.borderLeft = "5px solid #ff9800";
      elemento.style.boxShadow = "0 4px 8px rgba(255, 152, 0, 0.2)";
    } else {
      elemento.style.borderLeft = "5px solid #f44336";
      elemento.style.boxShadow = "0 4px 8px rgba(244, 67, 54, 0.2)";
    }
  };

  // Destacar la sección de motivos
  const seccionMotivos = document.querySelector(".form-section-card:nth-of-type(1)");
  aplicarEstilos(seccionMotivos, puntuacion.detalle.motivos.porcentaje);

  // Destacar la sección de signos
  const seccionSignos = document.querySelector(".form-section-card:nth-of-type(2)");
  aplicarEstilos(seccionSignos, puntuacion.detalle.elementos_clinicos.porcentaje);

  // Destacar la sección de exámenes
  const seccionExamenes = document.querySelector(".form-section-card:nth-of-type(5)");
  aplicarEstilos(seccionExamenes, puntuacion.detalle.examenes.porcentaje);

  // Destacar la sección de tratamientos
  // Buscar la sección de tratamientos por su título
  const secciones = Array.from(document.querySelectorAll(".form-section-card"));
  const seccionTratamientos = secciones.find(seccion => {
    const titulo = seccion.querySelector(".text-subtitle1");
    return titulo && titulo.textContent.trim().toUpperCase() === "TRATAMIENTO";
  });

  // Aplicar estilos a la sección de tratamientos si existe y hay puntuación
  if (seccionTratamientos && puntuacion.detalle.tratamientos?.porcentaje !== undefined) {
    aplicarEstilos(seccionTratamientos, puntuacion.detalle.tratamientos.porcentaje);
  }
}

// Función para preparar los motivos para enviar al backend
function prepararMotivosParaEnvio() {
  return motivoConsultas.value.map((motivo) => ({
    id: motivo.id,
    nombre: motivo.nombre,
    seleccionado: res.motivos.includes(motivo.nombre),
    respuestaCorrecta: motivo.respuestaCorrecta === 1,
  }));
}

// Función para preparar los elementos clínicos para enviar al backend
function prepararElementosClinicosParaEnvio() {
  return {
    signos: res.signos.map((signo) => ({
      manifestacion: signo.manifestacion,
      caracteristica: signo.caracteristica,
      parametro: signo.parametro,
      localizacion: signo.localizacion,
    })),
    sintomas: res.sintomas.map((sintoma) => ({
      manifestacion: sintoma.manifestacion,
      caracteristica: sintoma.caracteristica,
      parametro: sintoma.parametro,
      localizacion: sintoma.localizacion,
    })),
    sindromes: res.sindromes.map((sindrome) => ({
      manifestacion: sindrome.manifestacion,
    })),
  };
}

// Función para preparar los exámenes para enviar al backend
function prepararExamenesParaEnvio() {
  return examenes.value.map((examen) => ({
    id: examen.id,
    nombre: examen.nombre,
    seleccionado: res.examenes.includes(examen.nombre),
    respuestaCorrecta: examen.respuestaCorrecta === 1,
  }));
}

function abrirModalExamenes() {
  modalExamenes.value = true;
  examenSeleccionado.value = [];
  busquedaExamen.value = "";
}

function seleccionarExamen(examen) {
  const index = examenSeleccionado.value.indexOf(examen.nombre);
  if (index === -1) {
    examenSeleccionado.value.push(examen.nombre);
  } else {
    examenSeleccionado.value.splice(index, 1);
  }
}

function eliminarExamen(index) {
  // Pequeña animación antes de eliminar
  const examen = res.examenes[index];
  res.examenes.splice(index, 1);

  $q.notify({
    message: `Se eliminó "${examen}"`,
    color: "grey-7",
    icon: "remove_circle",
    position: "bottom-right",
    timeout: 1000,
  });
}

function añadirExamenesSeleccionados() {
  // Agregamos solo los exámenes que no estén ya en la lista
  const nuevosExamenes = examenSeleccionado.value.filter(
    (e) => !res.examenes.includes(e)
  );
  res.examenes.push(...nuevosExamenes);

  if (nuevosExamenes.length > 0) {
    $q.notify({
      type: "positive",
      message: `Se añadieron ${nuevosExamenes.length} exámenes`,
      position: "top",
      icon: "add_circle",
      timeout: 2000,
    });
  }

  modalExamenes.value = false;
}

function filtrarExamenes(val, update) {
  if (!busquedaExamen.value.trim()) {
    examenesDisponibles.value = examenes.value;
    return;
  }

  const needle = busquedaExamen.value.toLowerCase();
  examenesDisponibles.value = examenes.value.filter((examen) =>
    examen.nombre.toLowerCase().includes(needle)
  );
}

// Función para ver archivo
function verArchivoExamen(examen) {
  if (examen.archivo) {
    window.open(`${STORAGE_URL}/${examen.archivo}`, "_blank");
  } else {
    $q.notify({
      type: "warning",
      message: "No hay archivo disponible para este examen",
      position: "top",
      icon: "info",
      timeout: 2000,
    });
  }
}

function marcarRespuestasCorrectas(resultados) {
  marcarMotivosSeleccionados(resultados);

  // AÑADIR: Marcar diagnóstico
  if (resultados.diagnostico) {
    resultadoDiagnostico.value = resultados.diagnostico.estado;

    // También se puede añadir una animación o notificación
    if (resultados.diagnostico.estado === 'correcto') {
      $q.notify({
        message: 'Diagnóstico correcto',
        color: 'positive',
        icon: 'check_circle',
        position: 'top-right',
        timeout: 2000
      });
    }
  }

  // Marcar exámenes
  resultados.examenes.forEach((examen) => {
    if (examen.seleccionado) {
      // Encuentra la etiqueta correspondiente al examen
      const elementosExamen = document.querySelectorAll(".examen-tag-text");
      elementosExamen.forEach((elemento) => {
        if (elemento.textContent === examen.nombre) {
          const elementoPadre = elemento.closest(".examen-tag");
          if (elementoPadre) {
            // Aplicar estilos según el estado
            if (examen.estado === "correcto") {
              elementoPadre.classList.add("respuesta-correcta");
              // Añadir icono de verificación
              const iconoContainer = document.createElement("div");
              iconoContainer.classList.add("q-ml-auto");
              const iconoCorrect = document.createElement("q-icon");
              iconoCorrect.setAttribute("name", "check_circle");
              iconoCorrect.setAttribute("color", "positive");
              iconoCorrect.setAttribute("size", "18px");
              iconoContainer.appendChild(iconoCorrect);
              elementoPadre.appendChild(iconoContainer);
            } else if (examen.estado === "incorrecto") {
              elementoPadre.classList.add("respuesta-incorrecta");
              // Añadir icono de error
              const iconoContainer = document.createElement("div");
              iconoContainer.classList.add("q-ml-auto");
              const iconoError = document.createElement("q-icon");
              iconoError.setAttribute("name", "error");
              iconoError.setAttribute("color", "negative");
              iconoError.setAttribute("size", "18px");
              iconoContainer.appendChild(iconoError);
              elementoPadre.appendChild(iconoContainer);
            }
          }
        }
      });
    }

  });

  // AÑADIR: Marcar tratamientos
  if (resultados.tratamientos && resultados.tratamientos.length > 0) {
    // Si tienes la referencia al componente, puedes llamar a su método
    if (tratamientoResolucionRef.value) {
      // Enviar los estados de evaluación al componente de tratamientos
      const estadosPorFila = resultados.tratamientos.map(t => t.estados || {});
      tratamientoResolucionRef.value.marcarEstados(estadosPorFila);
    } else {
      // Alternativa: actualizar directamente el modelo
      resultados.tratamientos.forEach((tratamiento, index) => {
        if (index < res.tratamientos.length) {
          // Asegurarse de que existe la propiedad estados
          if (!res.tratamientos[index].estados) {
            res.tratamientos[index].estados = {};
          }

          // Copiar los estados
          res.tratamientos[index].estados = tratamiento.estados || {};
        }
      });
    }
  }

  // Marcar elementos clínicos (signos, síntomas, síndromes)
  // En lugar de usar DOM manipulation, actualizamos directamente el modelo reactivo
  actualizarModeloElementosClinicosConEstado(
    "signos",
    resultados.elementos_clinicos.signos
  );
  actualizarModeloElementosClinicosConEstado(
    "sintomas",
    resultados.elementos_clinicos.sintomas
  );
  actualizarModeloElementosClinicosConEstado(
    "sindromes",
    resultados.elementos_clinicos.sindromes
  );
}

function marcarMotivosSeleccionados(resultados) {
  console.log("Marcando motivos seleccionados:", resultados.motivos);

  // IMPORTANTE: Solo marcamos los motivos que el estudiante ha seleccionado
  resultados.motivos.forEach((motivo) => {
    // Solo procesamos los motivos seleccionados
    if (motivo.seleccionado) {
      console.log(
        `Procesando motivo seleccionado: ${motivo.nombre}, estado: ${motivo.estado}`
      );

      // Buscamos todos los checkboxes y encontramos el correcto comparando el texto adyacente
      const todosLosCheckboxes = document.querySelectorAll(".checkbox-item");
      let elementoPadre = null;

      // Iteramos por cada checkbox-item para encontrar el que tenga el texto correcto
      todosLosCheckboxes.forEach((item) => {
        const texto = item.textContent.trim();
        if (texto === motivo.nombre) {
          elementoPadre = item;
          console.log(
            `Encontrado elemento para ${motivo.nombre} con texto: ${texto}`
          );
        }
      });

      // Si encontramos el elemento, aplicamos los estilos
      if (elementoPadre) {
        // Limpiar clases previas para evitar conflictos
        elementoPadre.classList.remove(
          "respuesta-correcta",
          "respuesta-incorrecta"
        );

        // Remover iconos previos si existen
        const iconosPrevios = elementoPadre.querySelectorAll(
          ".icono-estado-motivo"
        );
        iconosPrevios.forEach((icono) => icono.remove());

        // Aplicar estilos según el estado
        if (motivo.estado === "correcto") {
          console.log(`Marcando ${motivo.nombre} como correcto`);
          elementoPadre.classList.add("respuesta-correcta");

          // Añadir icono de verificación usando iconos de Quasar
          const iconoCorrect = document.createElement("span");
          iconoCorrect.innerHTML =
            '<i class="q-icon fas fa-check-circle text-positive" style="font-size: 18px;"></i>';
          iconoCorrect.classList.add("icono-estado-motivo");
          elementoPadre.appendChild(iconoCorrect);
        } else if (motivo.estado === "incorrecto") {
          console.log(`Marcando ${motivo.nombre} como incorrecto`);
          elementoPadre.classList.add("respuesta-incorrecta");

          // Añadir icono de error usando iconos de Quasar
          const iconoError = document.createElement("span");
          iconoError.innerHTML =
            '<i class="q-icon fas fa-exclamation-circle text-negative" style="font-size: 18px;"></i>';
          iconoError.classList.add("icono-estado-motivo");
          elementoPadre.appendChild(iconoError);
        }
      } else {
        console.warn(
          `No se encontró el elemento para el motivo: ${motivo.nombre}`
        );

        // ALTERNATIVA DE RESPALDO: Buscar por coincidencia parcial si no se encuentra exacto
        const todosLosCheckboxes = document.querySelectorAll(".checkbox-item");
        todosLosCheckboxes.forEach((item) => {
          const texto = item.textContent.trim();
          if (texto.includes(motivo.nombre) || motivo.nombre.includes(texto)) {
            console.log(
              `Encontrada coincidencia parcial para ${motivo.nombre}: ${texto}`
            );

            // Limpiar clases previas
            item.classList.remove("respuesta-correcta", "respuesta-incorrecta");

            // Remover iconos previos
            const iconosPrevios = item.querySelectorAll(".icono-estado-motivo");
            iconosPrevios.forEach((icono) => icono.remove());

            // Aplicar el estilo correcto
            if (motivo.estado === "correcto") {
              item.classList.add("respuesta-correcta");
              const iconoCorrect = document.createElement("span");
              iconoCorrect.innerHTML =
                '<i class="q-icon fas fa-check-circle text-positive" style="font-size: 18px;"></i>';
              iconoCorrect.classList.add("icono-estado-motivo");
              item.appendChild(iconoCorrect);
            } else if (motivo.estado === "incorrecto") {
              item.classList.add("respuesta-incorrecta");
              const iconoError = document.createElement("span");
              iconoError.innerHTML =
                '<i class="q-icon fas fa-exclamation-circle text-negative" style="font-size: 18px;"></i>';
              iconoError.classList.add("icono-estado-motivo");
              item.appendChild(iconoError);
            }
          }
        });
      }
    }
  });
}

function actualizarModeloElementosClinicosConEstado(tipo, elementos) {
  // Obtenemos la referencia al array reactivo correspondiente
  let modeloArray;
  if (tipo === "signos") {
    modeloArray = res.signos;
  } else if (tipo === "sintomas") {
    modeloArray = res.sintomas;
  } else if (tipo === "sindromes") {
    modeloArray = res.sindromes;
  }

  // Actualizamos cada elemento con sus estados
  elementos.forEach((elemento, index) => {
    if (index < modeloArray.length) {
      // Aseguramos que tengamos la propiedad 'estados'
      if (!modeloArray[index].estados) {
        modeloArray[index].estados = {};
      }

      // Aplicamos los estados recibidos del backend
      if (elemento.estados) {
        // Si el backend envía estados por campo, los usamos directamente
        modeloArray[index].estados = elemento.estados;

        // Verificar campos vacíos para marcarlos como requeridos si es necesario
        if (tipo !== "sindromes") {
          // Para manifestación
          if (
            elemento.estados.manifestacion === "incorrecto" &&
            !modeloArray[index].manifestacion
          ) {
            modeloArray[index].estadosVacios =
              modeloArray[index].estadosVacios || {};
            modeloArray[index].estadosVacios.manifestacion = true;
          }

          // Para característica
          if (
            elemento.estados.caracteristica === "incorrecto" &&
            !modeloArray[index].caracteristica
          ) {
            modeloArray[index].estadosVacios =
              modeloArray[index].estadosVacios || {};
            modeloArray[index].estadosVacios.caracteristica = true;
          }

          // Para parámetro
          if (
            elemento.estados.parametro === "incorrecto" &&
            !modeloArray[index].parametro
          ) {
            modeloArray[index].estadosVacios =
              modeloArray[index].estadosVacios || {};
            modeloArray[index].estadosVacios.parametro = true;
          }

          // Para localización
          if (
            elemento.estados.localizacion === "incorrecto" &&
            !modeloArray[index].localizacion
          ) {
            modeloArray[index].estadosVacios =
              modeloArray[index].estadosVacios || {};
            modeloArray[index].estadosVacios.localizacion = true;
          }
        }
      } else if (elemento.estado) {
        // Compatibilidad con el formato antiguo (un solo estado general)
        const estadoGeneral = elemento.estado;

        // Para síndromes, solo manifestación
        if (tipo === "sindromes") {
          modeloArray[index].estados = {
            manifestacion: estadoGeneral,
          };
        } else {
          // Para signos y síntomas, todos los campos
          modeloArray[index].estados = {
            manifestacion: estadoGeneral,
            caracteristica: estadoGeneral,
            parametro: estadoGeneral,
            localizacion: estadoGeneral,
          };
        }
      }
    }
  });
}

function marcarElementosClinicos(tipo, elementos) {
  // Obtener los contenedores de elementos clínicos
  let contenedor;
  if (tipo === "signos") {
    contenedor = document.querySelector(".form-section-card:nth-of-type(2)");
  } else if (tipo === "sintomas") {
    contenedor = document.querySelector(".form-section-card:nth-of-type(3)");
  } else if (tipo === "sindromes") {
    contenedor = document.querySelector(".form-section-card:nth-of-type(4)");
  }

  if (!contenedor) return;

  // Buscar todas las filas de elementos clínicos
  const filas = contenedor.querySelectorAll(".row.items-center.bg-grey-1");

  // Marcar cada fila según el estado del elemento correspondiente
  filas.forEach((fila, index) => {
    if (elementos[index]) {
      // Marcar la fila completa
      if (elementos[index].estado === "correcto") {
        fila.classList.add("respuesta-correcta");
      } else if (elementos[index].estado === "incorrecto") {
        fila.classList.add("respuesta-incorrecta");
      }

      // Marcar cada campo individual
      const selectManifestacion = fila.querySelector(".q-select:nth-child(1)");
      const selectCaracteristica = fila.querySelector(".q-select:nth-child(2)");
      const selectParametro = fila.querySelector(".q-select:nth-child(3)");
      const selectLocalizacion = fila.querySelector(".q-select:nth-child(4)");

      // Aplicar estilos a cada campo según sea necesario
      if (selectManifestacion) {
        selectManifestacion.classList.add(
          elementos[index].estado === "correcto"
            ? "campo-correcto"
            : "campo-incorrecto"
        );
      }

      // Solo aplicar a característica, parámetro y localización si no es síndrome
      if (tipo !== "sindromes") {
        if (selectCaracteristica) {
          selectCaracteristica.classList.add(
            elementos[index].estado === "correcto"
              ? "campo-correcto"
              : "campo-incorrecto"
          );
        }
        if (selectParametro) {
          selectParametro.classList.add(
            elementos[index].estado === "correcto"
              ? "campo-correcto"
              : "campo-incorrecto"
          );
        }
        if (selectLocalizacion) {
          selectLocalizacion.classList.add(
            elementos[index].estado === "correcto"
              ? "campo-correcto"
              : "campo-incorrecto"
          );
        }
      }
    }
  });
}

// Limpiamos los intervalos cuando se desmonta el componente
onUnmounted(() => {
  if (intervaloHistoria) clearInterval(intervaloHistoria);
  if (intervaloResolucion) clearInterval(intervaloResolucion);
});
</script>

<style scoped>
/* Estilos generales */
.main-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
}

.timer-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-left: 4px solid var(--q-primary);
}

.form-section-card {
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  border-left: 3px solid var(--q-primary);
}

.form-section-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.section-header {
  display: flex;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

/* Estilos para modales */
.historia-modal,
.confirmacion-modal,
.resumen-modal {
  border-radius: 12px;
  overflow: hidden;
  width: 600px;
  max-width: 90vw;
}

.timer-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.historia-content {
  max-height: 60vh;
  overflow-y: auto;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 8px;
  border-left: 4px solid var(--q-primary);
}

.examen-item {
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.examen-item:hover {
  background-color: #f0f8ff;
}

/* Estilos para componentes específicos */
.checkbox-item {
  padding: 6px 10px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.checkbox-item:hover {
  background-color: rgba(33, 150, 243, 0.1);
}

.examenes-select .q-field__control {
  padding: 8px 12px;
}

.elemento-clinico {
  margin-top: 8px;
}

/* Animaciones */
.pulse-animation {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.bounce-animation {
  animation: bounce 2s infinite;
}

@keyframes bounce {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}

.pulse-success {
  animation: pulseSuccess 1.5s infinite;
}

@keyframes pulseSuccess {
  0% {
    transform: scale(1);
    opacity: 0.7;
  }

  50% {
    transform: scale(1.1);
    opacity: 1;
  }

  100% {
    transform: scale(1);
    opacity: 0.7;
  }
}

/* Botones con efectos */
.comenzar-btn {
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(33, 150, 243, 0.3);
}

.comenzar-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(33, 150, 243, 0.4);
}

.historia-btn {
  transition: all 0.3s ease;
  border-radius: 8px;
}

.historia-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(33, 150, 243, 0.3);
}

.enviar-btn {
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(76, 175, 80, 0.3);
  border-radius: 8px;
}

.enviar-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(76, 175, 80, 0.4);
}

/* Gradientes para cabeceras de modales */
.bg-gradient-primary {
  background: linear-gradient(135deg, var(--q-primary) 0%, #2979ff 100%);
}

.bg-gradient-success {
  background: linear-gradient(135deg, #4caf50 0%, #8bc34a 100%);
}

/* Responsividad adicional */
@media (max-width: 599px) {
  .main-card {
    border-radius: 0;
    box-shadow: none;
    margin: -16px;
  }

  .historia-content {
    max-height: 50vh;
  }

  .timer-container {
    flex-direction: column;
  }

  .form-section-card {
    margin-left: -8px;
    margin-right: -8px;
    border-radius: 0;
  }
}

/* Estilos para el modal de exámenes */
.examenes-modal {
  min-width: 500px;
  max-width: 90vw;
  height: auto;
  max-height: 90vh;
}

.examenes-lista-container {
  max-height: 50vh;
  overflow-y: auto;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

/* Estilo personalizado para la barra de desplazamiento */
.examenes-lista-container::-webkit-scrollbar {
  width: 8px;
}

.examenes-lista-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.examenes-lista-container::-webkit-scrollbar-thumb {
  background: #2196f3;
  border-radius: 4px;
}

.examenes-lista-container::-webkit-scrollbar-thumb:hover {
  background: #1976d2;
}

/* Para Firefox */
.examenes-lista-container {
  scrollbar-width: thin;
  scrollbar-color: #2196f3 #f1f1f1;
}

/* Mejora visual para elementos de la lista */
.examen-item {
  transition: background-color 0.2s ease;
}

.examen-item:hover {
  background-color: rgba(33, 150, 243, 0.08);
}

/* Estilos mejorados para las etiquetas de exámenes */
.examen-tag {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f5f9ff;
  border: 1px solid rgba(33, 150, 243, 0.3);
  border-left: 4px solid #2196f3;
  border-radius: 8px;
  padding: 10px 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  min-height: 46px;
}

.examen-tag:hover {
  box-shadow: 0 3px 8px rgba(33, 150, 243, 0.15);
  transform: translateY(-2px);
  background-color: #e9f4ff;
}

.examen-tag-content {
  display: flex;
  align-items: center;
  flex-grow: 1;
  overflow: hidden;
}

.examen-tag-text {
  font-weight: 500;
  color: #444;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-grow: 1;
  margin-right: 4px;
}

.examen-tag-delete {
  margin-left: 4px;
  opacity: 0.7;
  transition: all 0.2s ease;
}

.examen-tag-delete:hover {
  opacity: 1;
  background-color: rgba(0, 0, 0, 0.05);
}

/* Estado vacío mejorado */
.empty-state {
  padding: 30px 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  border: 1px dashed #ddd;
}

/* Estilos para la confirmación de exámenes */
.confirmacion-examenes-modal {
  width: 500px;
  max-width: 90vw;
}

.bg-gradient-secondary {
  background: linear-gradient(135deg, #8e24aa 0%, #6a1b9a 100%);
}

.estado-examenes-solicitados {
  padding: 15px;
  background-color: rgba(76, 175, 80, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.examen-enviado {
  border-color: rgba(76, 175, 80, 0.5);
  border-left-color: #4caf50;
  background-color: rgba(76, 175, 80, 0.05);
}

.examen-enviado .examen-tag-text {
  color: #2e7d32;
}

/* Estilos para respuestas correctas e incorrectas */
.respuesta-correcta {
  background-color: rgba(76, 175, 80, 0.1) !important;
  border-color: rgba(76, 175, 80, 0.5) !important;
  border-left-color: #4caf50 !important;
}

.respuesta-correcta:hover {
  background-color: rgba(76, 175, 80, 0.15) !important;
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(76, 175, 80, 0.2) !important;
}

.respuesta-incorrecta {
  background-color: rgba(244, 67, 54, 0.1) !important;
  border-color: rgba(244, 67, 54, 0.5) !important;
  border-left-color: #f44336 !important;
}

.respuesta-incorrecta:hover {
  background-color: rgba(244, 67, 54, 0.15) !important;
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(244, 67, 54, 0.2) !important;
}

/* Estilos para respuestas correctas e incorrectas */
.respuesta-correcta {
  background-color: rgba(76, 175, 80, 0.1) !important;
  border-color: rgba(76, 175, 80, 0.5) !important;
  border-left-color: #4caf50 !important;
}

.respuesta-correcta:hover {
  background-color: rgba(76, 175, 80, 0.15) !important;
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(76, 175, 80, 0.2) !important;
}

.respuesta-incorrecta {
  background-color: rgba(244, 67, 54, 0.1) !important;
  border-color: rgba(244, 67, 54, 0.5) !important;
  border-left-color: #f44336 !important;
}

.respuesta-incorrecta:hover {
  background-color: rgba(244, 67, 54, 0.15) !important;
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(244, 67, 54, 0.2) !important;
}

/* Estilos para campos individuales */
.campo-correcto {
  border: 2px solid #4caf50 !important;
}

.campo-correcto .q-field__control {
  background-color: rgba(76, 175, 80, 0.05) !important;
}

.campo-incorrecto {
  border: 2px solid #f44336 !important;
}

.campo-incorrecto .q-field__control {
  background-color: rgba(244, 67, 54, 0.05) !important;
}

.checkbox-item {
  position: relative;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
  display: flex;
  align-items: center;
}

.checkbox-item:hover {
  background-color: rgba(33, 150, 243, 0.05);
}

/* Estilos para respuestas correctas - SOLO SI ESTÁN SELECCIONADAS */
.checkbox-item.respuesta-correcta {
  background-color: rgba(76, 175, 80, 0.1) !important;
  border: 1px solid rgba(76, 175, 80, 0.5) !important;
  border-left: 4px solid #4caf50 !important;
  box-shadow: 0 2px 4px rgba(76, 175, 80, 0.15) !important;
  padding-right: 40px;
  /* Espacio para el icono */
}

.checkbox-item.respuesta-correcta:hover {
  background-color: rgba(76, 175, 80, 0.15) !important;
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(76, 175, 80, 0.2) !important;
}

.checkbox-item.respuesta-correcta .q-checkbox__inner {
  color: #4caf50 !important;
}

/* Estilos para respuestas incorrectas - SOLO SI ESTÁN SELECCIONADAS */
.checkbox-item.respuesta-incorrecta {
  background-color: rgba(244, 67, 54, 0.1) !important;
  border: 1px solid rgba(244, 67, 54, 0.5) !important;
  border-left: 4px solid #f44336 !important;
  box-shadow: 0 2px 4px rgba(244, 67, 54, 0.15) !important;
  padding-right: 40px;
  /* Espacio para el icono */
}

.checkbox-item.respuesta-incorrecta:hover {
  background-color: rgba(244, 67, 54, 0.15) !important;
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(244, 67, 54, 0.2) !important;
}

.checkbox-item.respuesta-incorrecta .q-checkbox__inner {
  color: #f44336 !important;
}

/* Estilos para el icono de estado */
.icono-estado-motivo {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
}

/* Estilos para el diálogo de confirmación */
:deep(.confirmacion-envio) {
  backdrop-filter: blur(3px);
}

:deep(.confirmacion-envio .q-card__section) {
  padding: 24px;
}

:deep(.confirmacion-envio .q-dialog__title) {
  font-size: 1.5rem;
  color: #d32f2f;
  display: flex;
  align-items: center;
}

:deep(.confirmacion-envio .q-dialog__title)::before {
  content: "⚠️";
  margin-right: 8px;
}

:deep(.confirmacion-envio .q-dialog__message) {
  font-size: 1.1rem;
  line-height: 1.5;
  padding: 16px 0;
}

:deep(.confirmacion-envio .q-card__actions) {
  padding: 16px;
}
</style>
