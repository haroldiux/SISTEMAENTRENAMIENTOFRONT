<template>
  <q-page padding class="bg-grey-2">
    <div class="evaluation-form-container q-mt-md">
      <!-- Título principal -->
      <div class="text-h5 text-deep-purple-9 q-mb-md q-px-md">Crear Nueva Evaluación</div>

      <!-- Contenido principal -->
      <q-card class="form-body q-pa-md shadow-3">
        <!-- Campos del formulario (fecha, nivel, etc) -->
        <div class="form-row three-columns q-col-gutter-md">
          <div class="form-group">
            <label class="form-label">Fecha inicio</label>
            <q-input outlined v-model="fechaInicio" mask="##/##/####" placeholder="dd/mm/aaaa" bg-color="white"
              class="rounded-borders">
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer text-deep-purple-7">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="fechaInicio" mask="DD/MM/YYYY" color="deep-purple">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="OK" color="deep-purple" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>

            <!-- Hora inicio -->
            <label class="form-label q-mt-sm">Hora inicio</label>
            <q-input outlined v-model="horaInicio" mask="##:##" placeholder="HH:MM" bg-color="white"
              class="time-input rounded-borders">
              <template v-slot:append>
                <q-icon name="access_time" class="cursor-pointer text-deep-purple-7">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-time v-model="horaInicio" format24h color="deep-purple">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="OK" color="deep-purple" flat />
                      </div>
                    </q-time>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>

          <div class="form-group">
            <label class="form-label">Fecha final</label>
            <q-input outlined v-model="fechaFin" mask="##/##/####" placeholder="dd/mm/aaaa" bg-color="white"
              class="rounded-borders">
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer text-deep-purple-7">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="fechaFin" mask="DD/MM/YYYY" color="deep-purple">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="OK" color="deep-purple" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>

            <!-- Hora fin -->
            <label class="form-label q-mt-sm">Hora final</label>
            <q-input outlined v-model="horaFin" mask="##:##" placeholder="HH:MM" bg-color="white"
              class="time-input rounded-borders">
              <template v-slot:append>
                <q-icon name="access_time" class="cursor-pointer text-deep-purple-7">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-time v-model="horaFin" format24h color="deep-purple">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="OK" color="deep-purple" flat />
                      </div>
                    </q-time>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>

          <div class="form-group">
            <label class="form-label">Nivel</label>
            <q-select outlined v-model="nivel" :options="nivelOptions" emit-value map-options bg-color="white"
              color="deep-purple" class="rounded-borders" />
          </div>
        </div>

        <!-- Título examen -->
        <div class="form-row q-col-gutter-md">
          <div class="form-group full-width">
            <label class="form-label">Título examen</label>
            <q-input outlined v-model="tituloExamen" placeholder="Escribe el título del examen" bg-color="white"
              color="deep-purple" class="rounded-borders" />
          </div>
        </div>

        <!-- Materia, Grupo, Modo de selección -->
        <div class="form-row three-columns q-col-gutter-md">
          <div class="form-group">
            <label class="form-label">Materia</label>
            <q-select outlined v-model="materia" :options="materiaOptions" option-value="value" option-label="label"
              emit-value map-options :loading="loadingMaterias"
              @update:model-value="cargarGrupos(); verificarCasosDisponibles()" bg-color="white" color="deep-purple"
              class="rounded-borders" />
          </div>

          <div class="form-group">
            <label class="form-label">Grupo</label>
            <q-select outlined v-model="grupo" :options="grupoOptions" option-value="value" option-label="label"
              emit-value map-options :loading="loadingGrupos" :disable="!materia" bg-color="white" color="deep-purple"
              class="rounded-borders" />
          </div>

          <div class="form-group">
            <label class="form-label">Modo de selección</label>
            <div class="q-mt-sm radio-group">
              <q-radio v-model="modoSeleccion" val="aleatorio" label="Aleatorio" color="deep-purple" />
              <q-radio v-model="modoSeleccion" val="manual" label="Manual" color="deep-purple" class="q-ml-md" />
            </div>
          </div>
        </div>

        <!-- Límite de casos (visible solo con modo aleatorio) -->
        <div v-if="modoSeleccion === 'aleatorio'" class="form-row q-col-gutter-md">
          <div class="form-group">
            <label class="form-label">Límite de casos</label>
            <q-input outlined v-model.number="limite" type="number" min="1" bg-color="white" color="deep-purple"
              class="rounded-borders" style="max-width: 200px" />
            <div class="casos-disponibles">
              Casos disponibles: {{ casosDisponibles }}
            </div>
          </div>
        </div>

        <!-- Opción para mostrar solo casos propios y botón actualizar -->
        <div v-if="modoSeleccion === 'manual'" class="form-row q-col-gutter-md">
          <div class="form-group" style="display: flex; align-items: center; gap: 15px;">
            <q-checkbox v-model="soloPropios" label="Mostrar solo mis casos" color="deep-purple"
              @update:model-value="cargarCasosDisponibles()" />
            <q-btn color="deep-purple" icon="refresh" label="Actualizar lista" flat :loading="loadingCasos"
              @click="cargarCasosDisponibles()" no-caps />
          </div>
        </div>
      </q-card>

      <!-- Sección exacta de selección de casos -->
      <q-card v-if="modoSeleccion === 'manual'" class="casos-section q-mt-md shadow-3">
        <!-- Cabecera de la sección de casos -->
        <q-card-section class="casos-section-header cursor-pointer" @click="toggleCasosPanel">
          <div class="casos-header-title">
            <q-icon name="list" color="deep-purple" size="24px" class="q-mr-sm" />
            <div>
              <div class="text-deep-purple-9 text-weight-medium">Selección de casos disponibles</div>
              <div class="text-caption text-grey-7">
                Haga clic para {{ casosPanelExpanded ? 'ocultar' : 'mostrar' }} la lista de casos
              </div>
            </div>
          </div>
          <q-icon :name="casosPanelExpanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'" color="deep-purple-7"
            size="24px" />
        </q-card-section>

        <!-- Panel de casos (colapsable) -->
        <q-slide-transition>
          <div v-show="casosPanelExpanded" class="casos-panel">
            <q-card-section class="q-pa-none">
              <!-- Barra de búsqueda y botones de acción -->
              <div class="casos-toolbar bg-grey-2">
                <div class="search-container">
                  <q-input v-model="filtro" placeholder="Buscar caso..." outlined dense class="search-input"
                    bg-color="white" color="deep-purple">
                    <template v-slot:prepend>
                      <q-icon name="search" color="deep-purple-7" />
                    </template>
                    <template v-slot:append v-if="filtro">
                      <q-icon name="clear" class="cursor-pointer" color="deep-purple-7" @click="filtro = ''" />
                    </template>
                  </q-input>
                </div>

                <div class="action-buttons">
                  <q-btn outline color="deep-purple" label="SELECCIONAR TODOS" @click="seleccionarTodosCasos" :disable="!casosFiltrados.length ||
                    casosFiltrados.length === casosSeleccionados.length
                    " class="q-mr-sm" no-caps />
                  <q-btn outline color="negative" label="DESMARCAR TODOS" @click="desmarcarTodosCasos"
                    :disable="!casosSeleccionados.length" no-caps />
                </div>
              </div>

              <!-- Tabla simple -->
              <div class="casos-table">
                <!-- Cabecera de tabla -->
                <div class="table-header bg-grey-3">
                  <div class="checkbox-column"></div>
                  <div class="title-column text-weight-medium">Título</div>
                  <div class="nivel-column text-weight-medium">Nivel</div>
                  <div class="author-column text-weight-medium">Autor</div>
                  <div class="action-column text-weight-medium">Acciones</div>
                </div>

                <!-- Estado de carga -->
                <div v-if="loadingCasos" class="text-center q-pa-xl">
                  <q-spinner color="deep-purple" size="3em" />
                  <div class="q-mt-sm">Cargando casos disponibles...</div>
                </div>

                <!-- Mensaje de sin casos para este nivel -->
                <div v-else-if="casosFiltrados.length === 0" class="no-results">
                  <div class="text-center q-pa-md text-grey-7">
                    <q-icon name="search_off" size="48px" class="q-mb-sm" />
                    <div>No se encontraron casos de nivel {{ getNivelText(nivel) }} para esta materia</div>
                    <div class="text-caption q-mt-sm">
                      Intente cambiar el nivel de dificultad o desmarcar "Mostrar solo mis casos"
                    </div>
                  </div>
                </div>

                <!-- Filas de la tabla con clases hover -->
                <div v-else v-for="caso in casosFiltradosPaginados" :key="caso.id" class="table-row hover-row">
                  <div class="checkbox-column">
                    <q-checkbox v-model="caso.selected" @update:model-value="actualizarSeleccion" dense
                      color="deep-purple" />
                  </div>
                  <div class="title-column">{{ caso.titulo }}</div>
                  <div class="nivel-column">
                    <div :class="['nivel-badge', getNivelClass(caso.nivel)]">
                      {{ getNivelText(caso.nivel) }}
                    </div>
                  </div>
                  <div class="author-column">{{ caso.docente?.nombre || 'Sin autor' }}</div>
                  <div class="action-column">
                    <q-btn round flat color="deep-purple" icon="visibility" size="sm" @click="verDetalleCaso(caso)" />
                  </div>
                </div>

                <!-- Mensaje de no resultados cuando hay filtro -->
                <div v-if="casosFiltrados.length > 0 && casosFiltradosPaginados.length === 0" class="no-results">
                  <div class="text-center q-pa-md text-grey-7">
                    <q-icon name="search_off" size="48px" class="q-mb-sm" />
                    <div>No se encontraron casos que coincidan con el filtro</div>
                  </div>
                </div>

                <!-- Footer de tabla con contador y paginación -->
                <div class="table-footer bg-grey-3">
                  <div class="selection-counter text-deep-purple-8 text-weight-medium">
                    {{ casosSeleccionados.length }} de
                    {{ casosFiltrados.length }} casos seleccionados
                  </div>

                  <div class="pagination-controls">
                    <q-pagination v-model="paginaActual" :max="totalPaginas" boundary-links direction-links
                      color="deep-purple" active-color="deep-purple" />
                  </div>
                </div>
              </div>
            </q-card-section>
          </div>
        </q-slide-transition>
      </q-card>

      <!-- Botón centrado -->
      <div class="form-actions q-my-lg">
        <q-btn color="deep-purple-8" label="GUARDAR EVALUACIÓN" @click="guardarEvaluacion" :loading="saving"
          :disable="!isValidForm" class="submit-button shadow-2" icon="save" no-caps unelevated />
      </div>
    </div>

    <!-- Diálogo de detalles de caso -->
    <q-dialog v-model="dialogDetalle">
      <q-card style="width: 700px; max-width: 90vw" class="rounded-borders">
        <q-card-section class="bg-deep-purple-8 text-white">
          <div class="text-h6">Detalles del caso</div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section v-if="casoSeleccionado">
          <div class="text-h6 q-mb-md text-deep-purple-9">{{ casoSeleccionado.titulo }}</div>

          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-6">
              <div class="text-subtitle2 text-grey-7">Nivel</div>
              <div :class="['nivel-badge', getNivelClass(casoSeleccionado.nivel)]">
                {{ getNivelText(casoSeleccionado.nivel) }}
              </div>
            </div>

            <div class="col-6">
              <div class="text-subtitle2 text-grey-7">Autor</div>
              <div class="text-weight-medium">{{ casoSeleccionado.docente?.nombre || 'Sin autor' }}</div>
            </div>
          </div>

          <div class="q-mb-md">
            <div class="text-subtitle2 text-grey-7">Descripción</div>
            <div class="descripcion-caso">
              {{ casoSeleccionado.descripcion || "Sin descripción disponible" }}
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="bg-grey-2 q-py-md">
          <q-btn flat label="Cerrar" color="deep-purple" v-close-popup />
          <q-btn :color="isSelected(casoSeleccionado?.id) ? 'negative' : 'deep-purple'"
            :icon="isSelected(casoSeleccionado?.id) ? 'remove' : 'add'" :label="isSelected(casoSeleccionado?.id)
              ? 'Quitar de evaluación'
              : 'Agregar a evaluación'
              " @click="toggleSeleccionCaso(casoSeleccionado?.id)" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { api } from 'boot/axios';

export default {
  name: "CrearEvaluacion",

  data() {
    return {
      fechaInicio: "",
      fechaFin: "",
      horaInicio: "08:00",
      horaFin: "18:00",
      nivel: null,
      tituloExamen: "",
      materia: null,
      grupo: null,
      limite: 1,
      casosDisponibles: 0,
      loading: false,
      loadingMaterias: false,
      loadingGrupos: false,
      saving: false,
      loadingCasos: false,
      casosFiltrados: [],
      casosSeleccionados: [],
      modoSeleccion: "manual",
      soloPropios: false,
      filtro: "",
      dialogDetalle: false,
      casoSeleccionado: null,
      paginaActual: 1,
      casosPorPagina: 10,
      casosPanelExpanded: true,
      gestionActiva: null, // Almacenar la gestión activa

      // Opciones para los selects
      nivelOptions: [
        { label: "Básico", value: 0 },
        { label: "Intermedio", value: 1 },
        { label: "Avanzado", value: 2 },
      ],
      materiaOptions: [],
      grupoOptions: [],
    };
  },

  computed: {
    casosFiltradosPaginados() {
      // Aplicar filtro
      let resultados = [...this.casosFiltrados];

      if (this.filtro) {
        const filtroLower = this.filtro.toLowerCase();
        resultados = resultados.filter(
          (caso) =>
            (caso.titulo || "").toLowerCase().includes(filtroLower) ||
            (this.getNivelText(caso.nivel) || "").toLowerCase().includes(filtroLower) ||
            (caso.docente?.nombre || "").toLowerCase().includes(filtroLower)
        );
      }

      // Añadir propiedad de selección a cada caso
      resultados = resultados.map((caso) => ({
        ...caso,
        selected: this.casosSeleccionados.includes(caso.id),
      }));

      // Aplicar paginación
      const inicio = (this.paginaActual - 1) * this.casosPorPagina;
      const fin = inicio + this.casosPorPagina;

      return resultados.slice(inicio, fin);
    },

    totalPaginas() {
      return Math.ceil(this.casosFiltrados.length / this.casosPorPagina);
    },

    isValidForm() {
      // Validación básica del formulario
      if (
        !this.fechaInicio ||
        !this.fechaFin ||
        !this.horaInicio ||
        !this.horaFin ||
        this.nivel === null ||
        !this.tituloExamen ||
        !this.materia ||
        !this.grupo
      ) {
        return false;
      }

      if (this.modoSeleccion === "aleatorio") {
        return this.limite > 0 && this.limite <= this.casosDisponibles;
      } else {
        return this.casosSeleccionados.length > 0;
      }
    },

    // Devuelve fecha y hora combinados para enviar a la API
    fechaHoraInicio() {
      if (!this.fechaInicio || !this.horaInicio) return null;
      const [day, month, year] = this.fechaInicio.split("/");
      const [hour, minute] = this.horaInicio.split(":");
      return `${year}-${month}-${day}T${hour}:${minute}:00`;
    },

    fechaHoraFin() {
      if (!this.fechaFin || !this.horaFin) return null;
      const [day, month, year] = this.fechaFin.split("/");
      const [hour, minute] = this.horaFin.split(":");
      return `${year}-${month}-${day}T${hour}:${minute}:00`;
    },

    // Estado visual para la sección de casos
    mostrarEstadoCarga() {
      return this.loadingCasos;
    },

    mostrarMensajeSinCasos() {
      return !this.loadingCasos && this.casosFiltrados.length === 0;
    }
  },

  mounted() {
    this.cargarMaterias();
    // Verificar si hay una gestión activa al iniciar
    this.verificarGestionActiva();
  },

  methods: {
    toggleCasosPanel() {
      this.casosPanelExpanded = !this.casosPanelExpanded;
    },

    async cargarMaterias() {
      this.loadingMaterias = true;
      try {
        const response = await api.get('/materias');
        this.materiaOptions = response.data.map(materia => ({
          label: materia.nombre,
          value: materia.id
        }));
      } catch (error) {
        this.$q.notify({
          color: "negative",
          message: "Error al cargar materias",
        });
      } finally {
        this.loadingMaterias = false;
      }
    },

    async cargarGrupos() {
      if (!this.materia) return;

      this.loadingGrupos = true;
      this.grupo = null; // Resetear grupo seleccionado
      this.grupoOptions = []; // Limpiar opciones anteriores

      try {
        // Obtener la gestión activa primero
        const gestionResponse = await api.get('/gestiones/activa');
        const gestionId = gestionResponse.data?.id;

        if (!gestionId) {
          this.$q.notify({
            color: "warning",
            message: "No hay una gestión académica activa configurada en el sistema",
            timeout: 3000
          });
          return;
        }

        // Ahora cargar grupos con el parámetro de gestión explícito
        const response = await api.get(`/materias/${this.materia}/grupos`, {
          params: { gestion_id: gestionId }
        });

        // Verificar la estructura de la respuesta y manejarla adecuadamente
        if (response.data && Array.isArray(response.data)) {
          this.grupoOptions = response.data.map(grupo => ({
            label: grupo.nombre,
            value: grupo.id
          }));

          // Si no hay grupos disponibles, mostrar una notificación
          if (this.grupoOptions.length === 0) {
            this.$q.notify({
              color: "warning",
              message: "No hay grupos disponibles para esta materia en la gestión actual",
              timeout: 3000
            });
          }
        } else {
          this.$q.notify({
            color: "warning",
            message: "Formato de respuesta inesperado al cargar grupos",
            timeout: 3000
          });
        }
      } catch (error) {
        this.$q.notify({
          color: "negative",
          message: "Error al cargar grupos: " + (error.response?.data?.message || error.message),
          timeout: 3000
        });
      } finally {
        this.loadingGrupos = false;
      }
    },

    async verificarCasosDisponibles() {
      if (!this.materia || !this.nivel) return;

      this.loading = true;
      try {
        // Parámetros para la petición API
        const params = {
          materia_id: this.materia,
          filtro_nivel_dificultad: this.nivel
        };

        // Solo agregar el parámetro solo_propios si el modo es manual
        if (this.modoSeleccion === 'manual') {
          params.solo_propios = this.soloPropios ? 1 : 0; // Enviar como 1/0 en lugar de true/false
        }

        const response = await api.get('/casos/disponibles', { params });

        this.casosDisponibles = response.data.total || 0;

        // Si estamos en modo manual, cargar los casos disponibles
        if (this.modoSeleccion === 'manual') {
          this.cargarCasosDisponibles();
        }
      } catch (error) {
        this.$q.notify({
          color: "negative",
          message: "Error al verificar casos disponibles: " + (error.response?.data?.message || error.message),
          timeout: 3000
        });

        // Por defecto establecer en 0
        this.casosDisponibles = 0;
      } finally {
        this.loading = false;
      }
    },

    async cargarCasosDisponibles() {
      if (!this.materia || this.nivel === null) {
        return;
      }

      this.loadingCasos = true;
      this.casosSeleccionados = []; // Resetear selecciones
      this.casosFiltrados = []; // Limpiar casos anteriores

      try {
        // Parámetros para la petición API
        const params = new URLSearchParams();
        params.append('materia_id', this.materia);
        params.append('filtro_nivel_dificultad', this.nivel);
        params.append('solo_propios', this.soloPropios ? '1' : '0');

        // Usar axios directamente
        const response = await this.$axios.get(`${this.$api.defaults.baseURL}/casos/disponibles?${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        // Verificar si hay casos en la respuesta
        if (response.data.casos && Array.isArray(response.data.casos)) {
          if (response.data.casos.length === 0) {
            this.$q.notify({
              color: "warning",
              message: `No se encontraron casos de nivel ${this.getNivelText(this.nivel)} para esta materia`,
              timeout: 3000
            });
          } else {
            // Procesar los casos
            this.casosFiltrados = response.data.casos.map(caso => {
              // Determinar el nivel adecuadamente
              let nivelCaso = null;
              if (caso.nivel_dificultad !== undefined) nivelCaso = caso.nivel_dificultad;
              else if (caso.nivel !== undefined) nivelCaso = caso.nivel;

              return {
                id: caso.id,
                titulo: caso.titulo || 'Sin título',
                nivel: nivelCaso,
                docente: {
                  nombre: caso.docente ? (caso.docente.nombre_completo || `${caso.docente.nombres || ''} ${caso.docente.apellidos || ''}`.trim()) : null
                },
                descripcion: caso.enunciado || caso.descripcion || 'Sin descripción disponible',
                selected: false
              };
            });
          }

          this.casosDisponibles = response.data.casos.length;
        } else {
          this.$q.notify({
            color: "warning",
            message: "La API devolvió un formato inesperado al cargar casos",
            timeout: 3000
          });

          this.casosFiltrados = [];
          this.casosDisponibles = 0;
        }
      } catch (error) {
        let errorMsg = "Error al cargar el listado de casos";
        if (error.response) {
          errorMsg += `: ${error.response.status} ${error.response.statusText}`;
          if (error.response.data && error.response.data.message) {
            errorMsg += ` - ${error.response.data.message}`;
          }
        } else if (error.message) {
          errorMsg += `: ${error.message}`;
        }

        this.$q.notify({
          color: "negative",
          message: errorMsg,
          timeout: 5000
        });

        // En caso de error, limpiar la lista
        this.casosFiltrados = [];
        this.casosDisponibles = 0;
      } finally {
        this.loadingCasos = false;
      }
    },

    getNivelClass(nivel) {
      switch (Number(nivel)) {
        case 0:
          return "nivel-basico";
        case 1:
          return "nivel-intermedio";
        case 2:
          return "nivel-avanzado";
        default:
          return "";
      }
    },

    getNivelText(nivel) {
      switch (Number(nivel)) {
        case 0:
          return "Básico";
        case 1:
          return "Intermedio";
        case 2:
          return "Avanzado";
        default:
          return nivel?.toString() || "Desconocido"; // Mostrar el valor tal cual si no coincide con ninguno conocido
      }
    },

    seleccionarTodosCasos() {
      // Marcar todos como seleccionados
      this.casosFiltrados.forEach((caso) => {
        caso.selected = true;
      });
      this.actualizarSeleccion();
    },

    desmarcarTodosCasos() {
      // Desmarcar todos
      this.casosFiltrados.forEach((caso) => {
        caso.selected = false;
      });
      this.actualizarSeleccion();
    },

    isSelected(casoId) {
      return this.casosSeleccionados.includes(casoId);
    },

    toggleSeleccionCaso(casoId) {
      if (!casoId) return;

      const caso = this.casosFiltrados.find((c) => c.id === casoId);
      if (caso) {
        caso.selected = !caso.selected;
        this.actualizarSeleccion();
      }
    },

    actualizarSeleccion() {
      // Actualizar array de casosSeleccionados basado en las propiedades selected
      this.casosSeleccionados = this.casosFiltrados
        .filter((caso) => caso.selected)
        .map((caso) => caso.id);
    },

    verDetalleCaso(caso) {
      this.casoSeleccionado = caso;
      this.dialogDetalle = true;
    },

    async guardarEvaluacion() {
      if (!this.isValidForm) {
        this.$q.notify({
          color: "negative",
          message: "Por favor, complete todos los campos requeridos",
          timeout: 2000,
        });
        return;
      }

      this.saving = true;
      try {
        // Verificar que haya una gestión activa
        if (!this.gestionActiva?.id) {
          const gestionResponse = await api.get('/gestiones/activa');
          if (!gestionResponse.data || !gestionResponse.data.id) {
            throw new Error("No hay una gestión académica activa. No se puede crear la evaluación.");
          }
          this.gestionActiva = gestionResponse.data;
        }

        const evaluacionData = {
          titulo: this.tituloExamen,
          fecha_inicio: this.fechaHoraInicio,
          fecha_fin: this.fechaHoraFin,
          filtro_nivel_dificultad: this.nivel,
          materia_id: this.materia,
          grupo_id: this.grupo,
          modo_seleccion: this.modoSeleccion,
          gestion_id: this.gestionActiva.id // Usar explícitamente la gestión activa
        };

        if (this.modoSeleccion === 'aleatorio') {
          evaluacionData.limite_casos = this.limite;
        } else {
          evaluacionData.casos_seleccionados = this.casosSeleccionados;
        }

        const response = await api.post('/evaluaciones', evaluacionData);

        this.$q.notify({
          color: "positive",
          message: "Evaluación guardada correctamente",
          timeout: 2000,
        });

        // Redireccionar a la página de evaluaciones
        this.$router.push('/app/docentes/mis-evaluaciones');
      } catch (error) {
        let errorMsg = "Error al guardar la evaluación";
        if (error.response?.data?.message) {
          errorMsg = error.response.data.message;
        } else if (error.message) {
          errorMsg = error.message;
        }

        this.$q.notify({
          color: "negative",
          message: errorMsg,
          timeout: 3000,
        });
      } finally {
        this.saving = false;
      }
    },

    async verificarGestionActiva() {
      try {
        const response = await api.get('/gestiones/activa');
        if (!response.data || !response.data.id) {
          this.$q.notify({
            color: "warning",
            message: "No hay una gestión académica activa. Se requiere una gestión activa para crear evaluaciones.",
            position: "top",
            timeout: 5000
          });
        } else {
          this.gestionActiva = response.data;
        }
      } catch (error) {
        this.$q.notify({
          color: "negative",
          message: "No se pudo verificar la gestión activa",
          position: "top",
          timeout: 3000
        });
      }
    },

    resetForm() {
      this.fechaInicio = "";
      this.fechaFin = "";
      this.horaInicio = "08:00";
      this.horaFin = "18:00";
      this.nivel = null;
      this.tituloExamen = "";
      this.materia = null;
      this.grupo = null;
      this.limite = 1;
      this.modoSeleccion = "manual";
      this.casosDisponibles = 0;
      this.casosSeleccionados = [];
      this.casosFiltrados = [];
      this.casosPanelExpanded = true;
      this.filtro = "";
      this.paginaActual = 1;
      this.soloPropios = false;
    },
  },
};
</script>

<style scoped>
.evaluation-form-container {
  max-width: 1200px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, sans-serif;
}

.form-body {
  border-radius: 8px;
  background-color: white;
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
}

.form-row.three-columns {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

.form-group {
  flex: 1;
  min-width: 200px;
}

.form-group.full-width {
  flex-basis: 100%;
  width: 100%;
  grid-column: span 3;
}

.form-label {
  display: block;
  margin-bottom: 5px;
  color: #555;
  font-weight: 500;
}

.radio-group {
  margin-top: 12px;
}

.casos-disponibles {
  margin-top: 5px;
  font-size: 0.8rem;
  color: #4A148C;
  font-weight: 500;
}

.separator {
  height: 1px;
  background-color: #e0e0e0;
  margin: 25px 0;
}

.form-actions {
  display: flex;
  justify-content: center;
  margin: 30px 0;
}

.submit-button {
  min-width: 220px;
  height: 45px;
  font-weight: 500;
  border-radius: 8px;
}

/* Casos sección */
.casos-section {
  border-radius: 8px;
  overflow: hidden;
}

/* Cabecera de la sección de casos */
.casos-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #f5f5f5;
}

.casos-header-title {
  display: flex;
  align-items: center;
}

/* Panel de contenidos de casos */
.casos-panel {
  background-color: white;
}

/* Barra de herramientas (búsqueda y botones) */
.casos-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #e0e0e0;
}

.search-input {
  width: 280px;
}

/* Tabla */
.casos-table {
  width: 100%;
  background-color: white;
}

.table-header {
  display: flex;
  padding: 15px;
  border-bottom: 1px solid #e0e0e0;
  font-weight: 500;
}

.table-row {
  display: flex;
  padding: 12px 15px;
  border-bottom: 1px solid #e0e0e0;
  align-items: center;
  transition: background-color 0.2s;
}

.hover-row:hover {
  background-color: #f6f1fb;
}

.table-row:last-child {
  border-bottom: none;
}

/* No results message */
.no-results {
  padding: 40px 0;
  text-align: center;
  color: #757575;
}

/* Columnas con exactamente el mismo ancho y alineación */
.checkbox-column {
  width: 50px;
  flex-shrink: 0;
}

.title-column {
  flex: 4;
  padding-right: 15px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nivel-column {
  flex: 1;
  min-width: 100px;
  display: flex;
  justify-content: flex-start;
}

.author-column {
  flex: 2;
  min-width: 150px;
}

.action-column {
  width: 50px;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
}

/* Badges para niveles */
.nivel-badge {
  display: inline-flex;
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
  color: white;
}

.nivel-basico {
  background-color: #4caf50;
  /* Verde */
}

.nivel-intermedio {
  background-color: #ff9800;
  /* Naranja */
}

.nivel-avanzado {
  background-color: #f44336;
  /* Rojo */
}

/* Footer de tabla con contador y paginación */
.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-top: 1px solid #e0e0e0;
  font-size: 0.9rem;
}

.descripcion-caso {
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
  margin-top: 5px;
  max-height: 200px;
  overflow-y: auto;
}

@media (max-width: 767px) {
  .form-row.three-columns {
    grid-template-columns: 1fr;
  }

  .form-group.full-width {
    grid-column: span 1;
  }

  .casos-toolbar {
    flex-direction: column;
    gap: 15px;
  }

  .search-input {
    width: 100%;
  }

  .action-buttons {
    display: flex;
    width: 100%;
    justify-content: space-between;
  }

  .table-header,
  .table-row {
    font-size: 0.9rem;
    padding: 10px;
  }

  .table-footer {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }

  .pagination-controls {
    width: 100%;
    display: flex;
    justify-content: center;
  }
}
</style>
