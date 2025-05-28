<!-- GestionLlavesPage.vue -->
<template>
  <q-page class="gestion-llaves-page">
    <!-- Cabecera -->
    <div class="bg-primary text-white q-pa-md">
      <div class="text-h5 text-weight-bold">Sistema de Gestión de Llaves</div>
      <div class="text-subtitle2">Facultad de Informática y Sistemas</div>
    </div>

    <!-- Título y filtros -->
    <div class="q-pa-md">
      <div class="row items-center justify-between q-mb-md">
        <div>
          <div class="text-h6 text-primary">Mapa Interactivo de Instalaciones</div>
          <div class="text-caption text-grey-8">Seleccione un aula o laboratorio para gestionar sus llaves</div>
        </div>
        <div class="row q-col-gutter-md">
          <div class="col-auto">
            <q-select
              v-model="filtroPersonal"
              :options="opcionesFiltro"
              label="Filtrar por personal"
              outlined
              dense
              style="width: 200px"
            />
          </div>
          <div class="col-auto">
            <q-input
              v-model="busqueda"
              outlined
              dense
              placeholder="Buscar aula o docente..."
              style="width: 250px"
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
        </div>
      </div>

      <!-- Leyenda de estados -->
      <div class="estados-legend bg-blue-1 q-pa-sm q-mb-md rounded-borders">
        <div class="row items-center">
          <div class="col-auto q-mr-md">Estados:</div>
          <div v-for="estado in estados" :key="estado.id" class="col-auto q-mr-md flex items-center">
            <q-badge rounded color="white" class="estado-badge">
              <div class="estado-circle" :class="estado.class"></div>
            </q-badge>
            <span class="q-ml-xs">{{ estado.label }}</span>
          </div>
        </div>
      </div>

      <!-- Plano interactivo -->
      <q-card class="q-mb-md">
        <q-card-section class="q-pa-md">
          <div class="plano-container">
            <div class="row q-col-gutter-md">
              <!-- Primera fila -->
              <div class="col-4">
                <q-card
                  v-bind="salas[0]"
                  class="sala-card"
                  :class="[`tipo-${salas[0].tipo.toLowerCase()}`, salas[0].ocupado ? `ocupado-${salas[0].ocupadoPor.toLowerCase()}` : '']"
                  @click="abrirModal(salas[0])"
                >
                  <q-card-section>
                    <div class="text-subtitle1 text-weight-medium">{{ salas[0].nombre }}</div>
                    <div class="text-caption">{{ salas[0].tipo }}</div>

                    <template v-if="salas[0].ocupado">
                      <q-badge :color="getColorByOcupante(salas[0].ocupadoPor)" class="q-mt-sm">
                        {{ salas[0].ocupadoPor }}
                      </q-badge>

                      <div class="ocupado-info q-mt-sm">
                        <div class="text-caption"><q-icon name="person" size="xs" /> {{ salas[0].responsable }}</div>
                        <div class="text-caption"><q-icon name="schedule" size="xs" /> {{ salas[0].horario }}</div>
                        <div v-if="salas[0].materia" class="text-caption"><q-icon name="book" size="xs" /> {{ salas[0].materia }}</div>
                      </div>
                    </template>
                  </q-card-section>
                </q-card>
              </div>

              <div class="col-4">
                <q-card
                  v-bind="salas[2]"
                  class="sala-card"
                  :class="[`tipo-${salas[2].tipo.toLowerCase()}`, salas[2].ocupado ? `ocupado-${salas[2].ocupadoPor.toLowerCase()}` : '']"
                  @click="abrirModal(salas[2])"
                >
                  <q-card-section>
                    <div class="text-subtitle1 text-weight-medium">{{ salas[2].nombre }}</div>
                    <div class="text-caption">{{ salas[2].tipo }}</div>

                    <template v-if="salas[2].ocupado">
                      <q-badge :color="getColorByOcupante(salas[2].ocupadoPor)" class="q-mt-sm">
                        {{ salas[2].ocupadoPor }}
                      </q-badge>

                      <div class="ocupado-info q-mt-sm">
                        <div class="text-caption"><q-icon name="person" size="xs" /> {{ salas[2].responsable }}</div>
                        <div class="text-caption"><q-icon name="schedule" size="xs" /> {{ salas[2].horario }}</div>
                        <div v-if="salas[2].materia" class="text-caption"><q-icon name="book" size="xs" /> {{ salas[2].materia }}</div>
                      </div>
                    </template>
                  </q-card-section>
                </q-card>
              </div>

              <div class="col-4">
                <q-card
                  v-bind="salas[5]"
                  class="sala-card"
                  :class="[`tipo-${salas[5].tipo.toLowerCase()}`, salas[5].ocupado ? `ocupado-${salas[5].ocupadoPor.toLowerCase()}` : '']"
                  @click="abrirModal(salas[5])"
                >
                  <q-card-section>
                    <div class="text-subtitle1 text-weight-medium">{{ salas[5].nombre }}</div>
                    <div class="text-caption">{{ salas[5].tipo }}</div>

                    <template v-if="salas[5].ocupado">
                      <q-badge :color="getColorByOcupante(salas[5].ocupadoPor)" class="q-mt-sm">
                        {{ salas[5].ocupadoPor }}
                      </q-badge>

                      <div class="ocupado-info q-mt-sm">
                        <div class="text-caption"><q-icon name="person" size="xs" /> {{ salas[5].responsable }}</div>
                        <div class="text-caption"><q-icon name="schedule" size="xs" /> {{ salas[5].horario }}</div>
                        <div v-if="salas[5].materia" class="text-caption"><q-icon name="book" size="xs" /> {{ salas[5].materia }}</div>
                      </div>
                    </template>
                  </q-card-section>
                </q-card>
              </div>

              <!-- Segunda fila -->
              <div class="col-4">
                <q-card
                  v-bind="salas[1]"
                  class="sala-card"
                  :class="[`tipo-${salas[1].tipo.toLowerCase()}`, salas[1].ocupado ? `ocupado-${salas[1].ocupadoPor.toLowerCase()}` : '']"
                  @click="abrirModal(salas[1])"
                >
                  <q-card-section>
                    <div class="text-subtitle1 text-weight-medium">{{ salas[1].nombre }}</div>
                    <div class="text-caption">{{ salas[1].tipo }}</div>

                    <template v-if="salas[1].ocupado">
                      <q-badge :color="getColorByOcupante(salas[1].ocupadoPor)" class="q-mt-sm">
                        {{ salas[1].ocupadoPor }}
                      </q-badge>

                      <div class="ocupado-info q-mt-sm">
                        <div class="text-caption"><q-icon name="person" size="xs" /> {{ salas[1].responsable }}</div>
                        <div class="text-caption"><q-icon name="schedule" size="xs" /> {{ salas[1].horario }}</div>
                        <div v-if="salas[1].materia" class="text-caption"><q-icon name="book" size="xs" /> {{ salas[1].materia }}</div>
                      </div>
                    </template>
                  </q-card-section>
                </q-card>
              </div>

              <div class="col-4">
                <q-card
                  v-bind="salas[7]"
                  class="sala-card"
                  :class="[`tipo-${salas[7].tipo.toLowerCase()}`, salas[7].ocupado ? `ocupado-${salas[7].ocupadoPor.toLowerCase()}` : '']"
                  @click="abrirModal(salas[7])"
                >
                  <q-card-section>
                    <div class="text-subtitle1 text-weight-medium">{{ salas[7].nombre }}</div>
                    <div class="text-caption">{{ salas[7].tipo }}</div>

                    <template v-if="salas[7].ocupado">
                      <q-badge :color="getColorByOcupante(salas[7].ocupadoPor)" class="q-mt-sm">
                        {{ salas[7].ocupadoPor }}
                      </q-badge>

                      <div class="ocupado-info q-mt-sm">
                        <div class="text-caption"><q-icon name="person" size="xs" /> {{ salas[7].responsable }}</div>
                        <div class="text-caption"><q-icon name="schedule" size="xs" /> {{ salas[7].horario }}</div>
                        <div v-if="salas[7].materia" class="text-caption"><q-icon name="book" size="xs" /> {{ salas[7].materia }}</div>
                      </div>
                    </template>
                  </q-card-section>
                </q-card>
              </div>

              <div class="col-4">
                <q-card
                  v-bind="salas[3]"
                  class="sala-card"
                  :class="[`tipo-${salas[3].tipo.toLowerCase()}`, salas[3].ocupado ? `ocupado-${salas[3].ocupadoPor.toLowerCase()}` : '']"
                  @click="abrirModal(salas[3])"
                >
                  <q-card-section>
                    <div class="text-subtitle1 text-weight-medium">{{ salas[3].nombre }}</div>
                    <div class="text-caption">{{ salas[3].tipo }}</div>

                    <template v-if="salas[3].ocupado">
                      <q-badge :color="getColorByOcupante(salas[3].ocupadoPor)" class="q-mt-sm">
                        {{ salas[3].ocupadoPor }}
                      </q-badge>

                      <div class="ocupado-info q-mt-sm">
                        <div class="text-caption"><q-icon name="person" size="xs" /> {{ salas[3].responsable }}</div>
                        <div class="text-caption"><q-icon name="schedule" size="xs" /> {{ salas[3].horario }}</div>
                        <div v-if="salas[3].materia" class="text-caption"><q-icon name="book" size="xs" /> {{ salas[3].materia }}</div>
                      </div>
                    </template>
                  </q-card-section>
                </q-card>
              </div>

              <!-- Tercera fila -->
              <div class="col-4">
                <q-card
                  v-bind="salas[4]"
                  class="sala-card"
                  :class="[`tipo-${salas[4].tipo.toLowerCase()}`, salas[4].ocupado ? `ocupado-${salas[4].ocupadoPor.toLowerCase()}` : '']"
                  @click="abrirModal(salas[4])"
                >
                  <q-card-section>
                    <div class="text-subtitle1 text-weight-medium">{{ salas[4].nombre }}</div>
                    <div class="text-caption">{{ salas[4].tipo }}</div>

                    <template v-if="salas[4].ocupado">
                      <q-badge :color="getColorByOcupante(salas[4].ocupadoPor)" class="q-mt-sm">
                        {{ salas[4].ocupadoPor }}
                      </q-badge>

                      <div class="ocupado-info q-mt-sm">
                        <div class="text-caption"><q-icon name="person" size="xs" /> {{ salas[4].responsable }}</div>
                        <div class="text-caption"><q-icon name="schedule" size="xs" /> {{ salas[4].horario }}</div>
                        <div v-if="salas[4].materia" class="text-caption"><q-icon name="book" size="xs" /> {{ salas[4].materia }}</div>
                      </div>
                    </template>
                  </q-card-section>
                </q-card>
              </div>

              <div class="col-8">
                <q-card
                  v-bind="salas[6]"
                  class="sala-card"
                  :class="[`tipo-${salas[6].tipo.toLowerCase()}`, salas[6].ocupado ? `ocupado-${salas[6].ocupadoPor.toLowerCase()}` : '']"
                  @click="abrirModal(salas[6])"
                >
                  <q-card-section>
                    <div class="text-subtitle1 text-weight-medium">{{ salas[6].nombre }}</div>
                    <div class="text-caption">{{ salas[6].tipo }}</div>

                    <template v-if="salas[6].ocupado">
                      <q-badge :color="getColorByOcupante(salas[6].ocupadoPor)" class="q-mt-sm">
                        {{ salas[6].ocupadoPor }}
                      </q-badge>

                      <div class="ocupado-info q-mt-sm">
                        <div class="text-caption"><q-icon name="person" size="xs" /> {{ salas[6].responsable }}</div>
                        <div class="text-caption"><q-icon name="schedule" size="xs" /> {{ salas[6].horario }}</div>
                        <div v-if="salas[6].materia" class="text-caption"><q-icon name="book" size="xs" /> {{ salas[6].materia }}</div>
                      </div>
                    </template>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Estadísticas -->
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-4">
          <q-card class="stats-card" flat bordered>
            <q-card-section class="bg-primary text-white text-center">
              <div class="text-h3">{{ estadisticas.llavesPrestadas }}</div>
            </q-card-section>
            <q-card-section class="text-center q-pt-sm q-pb-md">
              <div class="text-subtitle1 text-primary q-mb-xs">Llaves Prestadas</div>
              <q-icon name="vpn_key" color="primary" size="28px" />
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-4">
          <q-card class="stats-card" flat bordered>
            <q-card-section class="bg-green-8 text-white text-center">
              <div class="text-h3">{{ estadisticas.llavesDevoluciones }}</div>
            </q-card-section>
            <q-card-section class="text-center q-pt-sm q-pb-md">
              <div class="text-subtitle1 text-green-8 q-mb-xs">Devoluciones Hoy</div>
              <q-icon name="assignment_return" color="green-8" size="28px" />
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-4">
          <q-card class="stats-card" flat bordered>
            <q-card-section class="bg-orange-8 text-white text-center">
              <div class="text-h3">{{ estadisticas.llavesPendientes }}</div>
            </q-card-section>
            <q-card-section class="text-center q-pt-sm q-pb-md">
              <div class="text-subtitle1 text-orange-8 q-mb-xs">Pendientes</div>
              <q-icon name="pending_actions" color="orange-8" size="28px" />
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Dialog para gestión de llaves -->
    <q-dialog v-model="dialogGestion" persistent>
      <q-card style="width: 500px; max-width: 95vw;">
        <q-card-section class="dialog-header" :class="salaSeleccionada?.ocupado ? getHeaderClass(salaSeleccionada.ocupadoPor) : 'bg-primary'">
          <div class="text-h6 text-white">{{ salaSeleccionada?.nombre || '' }}</div>
          <q-space />
          <q-btn flat round icon="close" color="white" v-close-popup />
        </q-card-section>

        <template v-if="!modoConfirmacion">
          <q-card-section>
            <div class="text-subtitle1 text-grey-8 q-mb-md">
              {{ salaSeleccionada?.ocupado ? 'Información del espacio ocupado' : 'Gestión de llaves' }}
            </div>

            <template v-if="salaSeleccionada?.ocupado">
              <q-banner rounded class="bg-blue-1 q-mb-md">
                <template v-slot:avatar>
                  <q-icon name="info" color="primary" />
                </template>
                <div class="text-subtitle2">Esta sala está actualmente ocupada</div>
                <div class="q-mt-sm">
                  <div><span class="text-weight-medium">Responsable:</span> {{ salaSeleccionada.responsable }}</div>
                  <div><span class="text-weight-medium">Tipo:</span> {{ salaSeleccionada.ocupadoPor }}</div>
                  <template v-if="salaSeleccionada.ocupadoPor === 'Docente'">
                    <div><span class="text-weight-medium">Materia:</span> {{ salaSeleccionada.materia }}</div>
                  </template>
                  <div><span class="text-weight-medium">Horario:</span> {{ salaSeleccionada.horario }}</div>
                </div>
              </q-banner>

              <!-- Acciones para espacios ocupados -->
              <div class="row q-col-gutter-sm">
                <div class="col-12">
                  <q-btn
                    color="negative"
                    class="full-width"
                    label="Registrar Devolución"
                    icon="keyboard_return"
                    @click="iniciarDevolucion"
                  />
                </div>
              </div>
            </template>

            <template v-else>
              <!-- Selección de personal -->
              <div class="q-mb-md">
                <q-select
                  v-model="tipoPersonal"
                  :options="tiposPersonal"
                  label="Tipo de Personal"
                  outlined
                  map-options
                  emit-value
                  @update:model-value="cambioTipoPersonal"
                >
                  <template v-slot:selected-item="scope">
                    <div class="row items-center">
                      <q-icon :name="getIconByPersonal(scope.opt.value)" color="primary" size="20px" class="q-mr-xs" />
                      {{ scope.opt.label }}
                    </div>
                  </template>
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section avatar>
                        <q-icon :name="getIconByPersonal(scope.opt.value)" color="primary" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ scope.opt.label }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>

              <!-- Campo de CI para buscar personal -->
              <div class="q-mb-md">
                <q-input
                  v-model="ciIngresado"
                  label="CI del personal"
                  outlined
                  clearable
                  @keyup.enter="buscarPersona"
                >
                  <template v-slot:append>
                    <q-icon name="search" class="cursor-pointer" @click="buscarPersona" />
                  </template>
                </q-input>
              </div>

              <!-- Información del personal encontrado -->
              <div v-if="personaEncontrada" class="q-mt-md">
                <q-card bordered flat class="card-persona">
                  <q-card-section>
                    <div class="row items-center">
                      <q-avatar color="primary" text-color="white" size="48px">
                        {{ iniciales(personaEncontrada.nombre) }}
                      </q-avatar>
                      <div class="q-ml-md">
                        <div class="text-subtitle1 text-weight-medium">{{ personaEncontrada.nombre }}</div>
                        <div class="text-body2 text-grey-8">{{ personaEncontrada.cargo }}</div>
                      </div>
                    </div>
                  </q-card-section>

                  <!-- Campos adicionales según el tipo de personal -->
                  <q-card-section v-if="tipoPersonal === 'docente'">
                    <q-select
                      v-model="materiaSeleccionada"
                      :options="materiasDocente"
                      label="Materia a impartir"
                      outlined
                      dense
                      class="q-mb-sm"
                    />
                    <div class="row q-col-gutter-sm">
                      <div class="col-6">
                        <q-input
                          v-model="horaInicio"
                          label="Hora de inicio"
                          outlined
                          dense
                          mask="##:##"
                          placeholder="HH:MM"
                        />
                      </div>
                      <div class="col-6">
                        <q-input
                          v-model="horaFin"
                          label="Hora de finalización"
                          outlined
                          dense
                          mask="##:##"
                          placeholder="HH:MM"
                        />
                      </div>
                    </div>
                  </q-card-section>

                  <q-card-section v-else>
                    <div class="row q-col-gutter-sm">
                      <div class="col-12">
                        <q-input
                          v-model="tiempoEstimado"
                          label="Tiempo estimado (minutos)"
                          outlined
                          dense
                          type="number"
                        />
                      </div>
                    </div>
                  </q-card-section>

                  <q-card-actions align="right">
                    <q-btn
                      color="primary"
                      icon="key"
                      label="Prestar Llave"
                      @click="iniciarPrestamo"
                      :disable="!puedePrestar"
                    />
                  </q-card-actions>
                </q-card>
              </div>

              <!-- Mensaje de error si no se encuentra la persona -->
              <q-banner v-if="mostrarError" class="bg-red-1 text-red-9 q-mt-md" rounded>
                <template v-slot:avatar>
                  <q-icon name="error" color="negative" />
                </template>
                No se encontró ninguna persona con el CI ingresado.
              </q-banner>
            </template>
          </q-card-section>
        </template>

        <!-- Modo confirmación -->
        <template v-else>
          <q-card-section class="column items-center q-py-lg">
            <q-icon
              :name="accion === 'prestar' ? 'vpn_key' : 'keyboard_return'"
              :color="accion === 'prestar' ? 'primary' : 'negative'"
              size="64px"
              class="q-mb-md"
            />
            <div class="text-h6">Confirmar {{ accion === 'prestar' ? 'Préstamo' : 'Devolución' }}</div>
            <div class="text-subtitle1 q-mt-sm">{{ salaSeleccionada?.nombre }}</div>

            <q-card bordered flat class="q-mt-md full-width">
              <q-card-section>
                <div class="text-subtitle2 q-mb-sm">Resumen:</div>
                <div class="q-mb-xs">
                  <span class="text-weight-medium">Responsable:</span> {{ personaEncontrada?.nombre }}
                </div>
                <div class="q-mb-xs">
                  <span class="text-weight-medium">Cargo:</span> {{ tipoPersonal === 'docente' ? 'Docente' : tipoPersonal.charAt(0).toUpperCase() + tipoPersonal.slice(1) }}
                </div>
                <template v-if="tipoPersonal === 'docente'">
                  <div class="q-mb-xs">
                    <span class="text-weight-medium">Materia:</span> {{ materiaSeleccionada }}
                  </div>
                  <div class="q-mb-xs">
                    <span class="text-weight-medium">Horario:</span> {{ horaInicio }} - {{ horaFin }}
                  </div>
                </template>
                <template v-else>
                  <div class="q-mb-xs">
                    <span class="text-weight-medium">Tiempo estimado:</span> {{ tiempoEstimado }} minutos
                  </div>
                </template>
              </q-card-section>
            </q-card>
          </q-card-section>

          <q-card-actions align="center" class="q-pb-md">
            <q-btn
              flat
              color="grey-7"
              label="Cancelar"
              v-close-popup
              @click="modoConfirmacion = false"
            />
            <q-btn
              :color="accion === 'prestar' ? 'primary' : 'negative'"
              :label="accion === 'prestar' ? 'Confirmar Préstamo' : 'Confirmar Devolución'"
              @click="confirmarAccion"
            />
          </q-card-actions>
        </template>
      </q-card>
    </q-dialog>

    <!-- Notificación de éxito -->
    <q-dialog v-model="notificacionVisible">
      <q-card :class="notificacionColor" style="min-width: 300px">
        <q-card-section class="row items-center">
          <q-avatar :icon="notificacionIcono" color="white" :text-color="notificacionColor.replace('bg-', '')" />
          <span class="text-h6 q-ml-md">{{ notificacionTitulo }}</span>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          {{ notificacionMensaje }}
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, computed } from 'vue';

export default {
  name: 'GestionLlavesPage',

  setup() {
    // Estados del componente
    const dialogGestion = ref(false);
    const salaSeleccionada = ref(null);
    const ciIngresado = ref('');
    const personaEncontrada = ref(null);
    const modoConfirmacion = ref(false);
    const accion = ref('prestar');
    const mostrarError = ref(false);
    const notificacionVisible = ref(false);
    const notificacionMensaje = ref('');
    const notificacionTitulo = ref('');
    const notificacionIcono = ref('');
    const notificacionColor = ref('');
    const filtroPersonal = ref(null);
    const busqueda = ref('');
    const tipoPersonal = ref('docente');
    const materiaSeleccionada = ref(null);
    const horaInicio = ref('');
    const horaFin = ref('');
    const tiempoEstimado = ref(30);

    // Estados de ocupación
    const estados = [
      { id: 'disponible', label: 'Disponible', class: 'estado-disponible' },
      { id: 'clase', label: 'En clase', class: 'estado-clase' },
      { id: 'limpieza', label: 'Limpieza', class: 'estado-limpieza' },
      { id: 'mantenimiento', label: 'Mantenimiento', class: 'estado-mantenimiento' },
      { id: 'soporte', label: 'Soporte TI', class: 'estado-soporte' }
    ];

    // Opciones de filtro de personal
    const opcionesFiltro = [
      { label: 'Todos', value: null },
      { label: 'Docentes', value: 'docente' },
      { label: 'Limpieza', value: 'limpieza' },
      { label: 'Mantenimiento', value: 'mantenimiento' },
      { label: 'Soporte', value: 'soporte' }
    ];

    // Tipos de personal
    const tiposPersonal = [
      { label: 'Docente', value: 'docente', icon: 'school' },
      { label: 'Limpieza', value: 'limpieza', icon: 'cleaning_services' },
      { label: 'Mantenimiento', value: 'mantenimiento', icon: 'build' },
      { label: 'Soporte TI', value: 'soporte', icon: 'computer' }
    ];

    // Obtener el icono según el tipo de personal
    const getIconByPersonal = (tipo) => {
      const personal = tiposPersonal.find(p => p.value === tipo);
      return personal ? personal.icon : 'person';
    };

    // Materias para docentes
    const materiasDocente = [
      'Programación I',
      'Programación II',
      'Bases de Datos',
      'Redes de Computadoras',
      'Sistemas Operativos',
      'Ingeniería de Software',
      'Inteligencia Artificial',
      'Álgebra Lineal',
      'Cálculo Diferencial',
      'Arquitectura de Computadoras'
    ];

    // Base de datos simulada de personas
    const personas = [
      { ci: '12345678', nombre: 'Juan Pérez', cargo: 'Docente', departamento: 'Programación' },
      { ci: '87654321', nombre: 'María López', cargo: 'Docente', departamento: 'Bases de Datos' },
      { ci: '11223344', nombre: 'Carlos Gómez', cargo: 'Personal de Mantenimiento', area: 'Electrónica' },
      { ci: '55667788', nombre: 'Lucía Mendoza', cargo: 'Personal de Limpieza', area: 'General' },
      { ci: '99001122', nombre: 'Roberto Salazar', cargo: 'Soporte TI', area: 'Redes' },
    ];

    // Estadísticas simuladas
    const estadisticas = {
      llavesPrestadas: 13,
      llavesDevoluciones: 8,
      llavesPendientes: 5
    };

    // Definición de salas en el mapa
    const salas = ref([
      {
        id: 'aula101',
        nombre: 'Aula 101',
        tipo: 'Aula',
        ocupado: false,
        ocupadoPor: null,
        responsable: null,
        materia: null,
        horario: null
      },
      {
        id: 'aula102',
        nombre: 'Aula 102',
        tipo: 'Aula',
        ocupado: true,
        ocupadoPor: 'Docente',
        responsable: 'María López',
        materia: 'Programación II',
        horario: '14:00 - 16:00'
      },
      {
        id: 'lab_fisica',
        nombre: 'Lab. Física',
        tipo: 'Laboratorio',
        ocupado: false,
        ocupadoPor: null,
        responsable: null,
        materia: null,
        horario: null
      },
      {
        id: 'lab_prog',
        nombre: 'Lab. Programación',
        tipo: 'Laboratorio',
        ocupado: true,
        ocupadoPor: 'Mantenimiento',
        responsable: 'Carlos Gómez',
        materia: null,
        horario: '09:00 - 10:30'
      },
      {
        id: 'biblioteca',
        nombre: 'Biblioteca',
        tipo: 'Biblioteca',
        ocupado: false,
        ocupadoPor: null,
        responsable: null,
        materia: null,
        horario: null
      },
      {
        id: 'ayudantia',
        nombre: 'Ay. Lojum',
        tipo: 'Ayudantía',
        ocupado: false,
        ocupadoPor: null,
        responsable: null,
        materia: null,
        horario: null
      },
      {
        id: 'lab_sistemas',
        nombre: 'Lab. Inf. y Sistemas',
        tipo: 'Laboratorio',
        ocupado: true,
        ocupadoPor: 'Limpieza',
        responsable: 'Roberto Salazar',
        materia: null,
        horario: '08:00 - 12:00'
      },
      {
        id: 'asuntos_escolares',
        nombre: 'Asuntos Escolares',
        tipo: 'Administrativo',
        ocupado: true,
        ocupadoPor: 'Limpieza',
        responsable: 'Lucía Mendoza',
        materia: null,
        horario: '10:00 - 11:00'
      }
    ]);

    // Obtener color de clase para el encabezado del diálogo
    const getHeaderClass = (ocupante) => {
      switch (ocupante) {
        case 'Docente': return 'bg-green-9';
        case 'Limpieza': return 'bg-blue-9';
        case 'Mantenimiento': return 'bg-orange-9';
        case 'Soporte': return 'bg-purple-9';
        default: return 'bg-primary';
      }
    };

    // Obtener color de badge para ocupante
    const getColorByOcupante = (ocupante) => {
      switch (ocupante) {
        case 'Docente': return 'green';
        case 'Limpieza': return 'blue';
        case 'Mantenimiento': return 'orange';
        case 'Soporte': return 'purple';
        default: return 'grey';
      }
    };

    // Obtener iniciales del nombre
    const iniciales = (nombre) => {
      if (!nombre) return '';
      return nombre
        .split(' ')
        .map(palabra => palabra.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
    };

    // Verificar si se puede prestar
    const puedePrestar = computed(() => {
      if (!personaEncontrada.value) return false;

      if (tipoPersonal.value === 'docente') {
        return !!materiaSeleccionada.value && !!horaInicio.value && !!horaFin.value;
      } else {
        return !!tiempoEstimado.value;
      }
    });

    // Funciones para manejar eventos
    const abrirModal = (sala) => {
      salaSeleccionada.value = sala;
      dialogGestion.value = true;
      resetearEstadoModal();
    };

    const resetearEstadoModal = () => {
      ciIngresado.value = '';
      personaEncontrada.value = null;
      modoConfirmacion.value = false;
      mostrarError.value = false;
      materiaSeleccionada.value = null;
      horaInicio.value = '';
      horaFin.value = '';
      tiempoEstimado.value = 30;
    };

    const buscarPersona = () => {
      if (!ciIngresado.value.trim()) return;

      mostrarError.value = false;
      const persona = personas.find(p => p.ci === ciIngresado.value);

      if (persona) {
        personaEncontrada.value = persona;

        // Ajustar automáticamente el tipo de personal según la persona encontrada
        if (persona.cargo.includes('Docente')) {
          tipoPersonal.value = 'docente';
        } else if (persona.cargo.includes('Limpieza')) {
          tipoPersonal.value = 'limpieza';
        } else if (persona.cargo.includes('Mantenimiento')) {
          tipoPersonal.value = 'mantenimiento';
        } else if (persona.cargo.includes('Soporte')) {
          tipoPersonal.value = 'soporte';
        }
      } else {
        personaEncontrada.value = null;
        mostrarError.value = true;
      }
    };

    const cambioTipoPersonal = () => {
      // Reset de valores específicos cuando cambia el tipo de personal
      if (tipoPersonal.value === 'docente') {
        materiaSeleccionada.value = null;
        horaInicio.value = '';
        horaFin.value = '';
      } else {
        tiempoEstimado.value = 30;
      }
    };

    const iniciarPrestamo = () => {
      accion.value = 'prestar';
      modoConfirmacion.value = true;
    };

    const iniciarDevolucion = () => {
      accion.value = 'devolver';
      modoConfirmacion.value = true;
    };

    const confirmarAccion = () => {
      if (accion.value === 'prestar') {
        // Actualizar sala como ocupada
        const sala = salas.value.find(s => s.id === salaSeleccionada.value.id);
        if (sala) {
          sala.ocupado = true;
          sala.ocupadoPor = tipoPersonal.value === 'docente' ? 'Docente' : tipoPersonal.value.charAt(0).toUpperCase() + tipoPersonal.value.slice(1);
          sala.responsable = personaEncontrada.value.nombre;

          if (tipoPersonal.value === 'docente') {
            sala.materia = materiaSeleccionada.value;
            sala.horario = `${horaInicio.value} - ${horaFin.value}`;
          } else {
            sala.materia = null;
            sala.horario = `${new Date().getHours()}:${new Date().getMinutes()} - estimado ${tiempoEstimado.value} min`;
          }

          // Actualizar estadísticas
          estadisticas.llavesPrestadas++;
          estadisticas.llavesPendientes++;
        }

        // Configurar notificación
        notificacionTitulo.value = 'Préstamo Exitoso';
        notificacionMensaje.value = `Se ha registrado el préstamo de la llave para ${salaSeleccionada.value.nombre} a ${personaEncontrada.value.nombre}.`;
        notificacionIcono.value = 'check_circle';
        notificacionColor.value = 'bg-positive';
      } else {
        // Actualizar sala como libre
        const sala = salas.value.find(s => s.id === salaSeleccionada.value.id);
        if (sala) {
          sala.ocupado = false;
          sala.ocupadoPor = null;
          sala.responsable = null;
          sala.materia = null;
          sala.horario = null;

          // Actualizar estadísticas
          estadisticas.llavesDevoluciones++;
          estadisticas.llavesPendientes--;
        }

        // Configurar notificación
        notificacionTitulo.value = 'Devolución Registrada';
        notificacionMensaje.value = `Se ha registrado la devolución de la llave para ${salaSeleccionada.value.nombre}.`;
        notificacionIcono.value = 'assignment_turned_in';
        notificacionColor.value = 'bg-info';
      }

      // Cerrar diálogo y mostrar notificación
      dialogGestion.value = false;
      modoConfirmacion.value = false;
      notificacionVisible.value = true;

      // Ocultar notificación después de un tiempo
      setTimeout(() => {
        notificacionVisible.value = false;
      }, 3000);
    };

    return {
      dialogGestion,
      salaSeleccionada,
      ciIngresado,
      personaEncontrada,
      modoConfirmacion,
      accion,
      mostrarError,
      notificacionVisible,
      notificacionMensaje,
      notificacionTitulo,
      notificacionIcono,
      notificacionColor,
      salas,
      estados,
      estadisticas,
      filtroPersonal,
      opcionesFiltro,
      busqueda,
      tipoPersonal,
      tiposPersonal,
      materiaSeleccionada,
      materiasDocente,
      horaInicio,
      horaFin,
      tiempoEstimado,
      puedePrestar,
      abrirModal,
      buscarPersona,
      iniciarPrestamo,
      iniciarDevolucion,
      confirmarAccion,
      getColorByOcupante,
      getHeaderClass,
      getIconByPersonal,
      iniciales,
      cambioTipoPersonal
    };
  }
};
</script>

<style scoped>
/* Estilos generales */
.gestion-llaves-page {
  background-color: #f5f7fa;
  min-height: 100vh;
}

/* Estilos para la leyenda de estados */
.estados-legend {
  border-left: 4px solid #bbdefb;
}

.estado-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
}

.estado-circle {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid;
}

.estado-disponible {
  background-color: #e0e0e0;
  border-color: #9e9e9e;
}

.estado-clase {
  background-color: #c8e6c9;
  border-color: #4caf50;
}

.estado-limpieza {
  background-color: #bbdefb;
  border-color: #2196f3;
}

.estado-mantenimiento {
  background-color: #ffe0b2;
  border-color: #ff9800;
}

.estado-soporte {
  background-color: #e1bee7;
  border-color: #9c27b0;
}

/* Estilos para la visualización del plano */
.plano-container {
  min-height: 400px;
}

.sala-card {
  height: 100%;
  transition: all 0.2s ease;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  border: 2px solid transparent;
  min-height: 120px;
}

.sala-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  z-index: 10;
}

/* Tipos de salas */
.tipo-aula {
  background-color: #e3f2fd;
  border-color: #90caf9;
  color: #1565c0;
}

.tipo-laboratorio {
  background-color: #e8f5e9;
  border-color: #a5d6a7;
  color: #2e7d32;
}

.tipo-biblioteca {
  background-color: #f3e5f5;
  border-color: #ce93d8;
  color: #7b1fa2;
}

.tipo-administrativo {
  background-color: #fff8e1;
  border-color: #ffe082;
  color: #ff8f00;
}

.tipo-ayudantía {
  background-color: #ffebee;
  border-color: #ef9a9a;
  color: #c62828;
}

/* Estados de ocupación */
.ocupado-docente {
  background-color: rgba(76, 175, 80, 0.15);
  border-color: #4caf50;
}

.ocupado-limpieza {
  background-color: rgba(33, 150, 243, 0.15);
  border-color: #2196f3;
}

.ocupado-mantenimiento {
  background-color: rgba(255, 152, 0, 0.15);
  border-color: #ff9800;
}

.ocupado-soporte {
  background-color: rgba(156, 39, 176, 0.15);
  border-color: #9c27b0;
}

/* Ocupado info */
.ocupado-info {
  border-top: 1px dashed rgba(0, 0, 0, 0.1);
  padding-top: 5px;
  margin-top: 5px;
}

/* Stats cards */
.stats-card {
  transition: transform 0.3s ease;
  border-radius: 8px;
  overflow: hidden;
}

.stats-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* Dialog header */
.dialog-header {
  padding: 12px 20px;
}

.card-persona {
  border-left: 4px solid #1976d2;
}
</style>
