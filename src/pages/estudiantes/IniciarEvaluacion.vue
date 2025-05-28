<template>
  <q-page padding class="bg-grey-2">
    <div class="evaluation-container q-mt-md">
      <div v-if="loading" class="text-center q-pa-xl">
        <q-spinner color="deep-purple" size="3em" />
        <div class="text-deep-purple q-mt-sm">Cargando evaluación...</div>
      </div>

      <div v-else>
        <!-- Cabecera con información de la evaluación -->
        <div class="text-h5 text-deep-purple-9 q-mb-sm">{{ evaluacion.titulo }}</div>
        <div class="text-subtitle1 q-mb-md text-grey-8">
          {{ evaluacion.materia.nombre }} |
          <q-icon name="schedule" size="18px" class="q-mr-xs" />
          Tiempo restante: {{ tiempoRestante }}
        </div>

        <!-- Tarjeta de inicio de caso -->
        <q-card class="inicio-caso-card shadow-3">
          <q-card-section>
            <div class="text-h6 text-deep-purple-9">{{ caso.titulo }}</div>
            <div class="q-mt-md text-body1">
              <p>Se te ha asignado este caso clínico para su resolución como parte de la evaluación.</p>
              <p class="text-weight-medium">
                Una vez que inicies el caso, tendrás hasta el final del período de evaluación para completarlo.
              </p>
            </div>
          </q-card-section>

          <q-card-actions align="center" class="q-py-md">
            <q-btn
              color="deep-purple-8"
              label="INICIAR RESOLUCIÓN DE CASO"
              @click="iniciarResolucion"
              class="full-width-btn"
              icon="play_arrow"
              no-caps
              unelevated
            />
          </q-card-actions>
        </q-card>

        <!-- Información adicional -->
        <q-card class="info-card q-mt-md shadow-1">
          <q-card-section>
            <div class="text-subtitle1 text-deep-purple-9 text-weight-medium">
              <q-icon name="info" class="q-mr-xs" /> Importante
            </div>
            <ul class="q-my-sm">
              <li>No podrás ver ninguna información del caso hasta que inicies la resolución.</li>
              <li>Una vez iniciada, deberás completar tu resolución antes de que finalice el período de evaluación.</li>
              <li>No cierres tu navegador durante la resolución para evitar pérdida de datos.</li>
            </ul>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Diálogo de tiempo agotado -->
    <q-dialog v-model="dialogTiempoAgotado" persistent>
      <q-card style="width: 400px">
        <q-card-section class="bg-negative text-white">
          <div class="text-h6">Tiempo Agotado</div>
        </q-card-section>

        <q-card-section class="q-pt-lg">
          <p>El tiempo para realizar esta evaluación ha finalizado.</p>
        </q-card-section>

        <q-card-actions align="right" class="bg-grey-2 q-py-md">
          <q-btn flat label="Entendido" color="deep-purple" v-close-popup @click="volverAEvaluaciones" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
export default {
  name: "IniciarEvaluacion",

  data() {
    return {
      loading: true,
      evaluacion: {
        titulo: "",
        fecha_inicio: "",
        fecha_fin: "",
        materia: { nombre: "" }
      },
      caso: {
        id: null,
        titulo: ""
      },
      tiempoRestante: "",
      timerInterval: null,
      dialogTiempoAgotado: false
    };
  },

  created() {
    this.cargarEvaluacion();
  },

  beforeUnmount() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  },

  methods: {
    async cargarEvaluacion() {
      this.loading = true;
      try {
        // Verificar si hay token
        const token = localStorage.getItem('token');
        if (!token) {
          this.$q.notify({
            message: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
            color: 'negative',
            position: 'top'
          });
          this.$router.push('/');
          return;
        }

        // Obtener ID de evaluación
        const evaluacionId = this.$route.params.id;
        if (!evaluacionId) {
          throw new Error('ID de evaluación no encontrado');
        }

        console.log('Cargando evaluación con ID:', evaluacionId);
        const response = await this.$api.get(`/evaluaciones/${evaluacionId}/caso-estudiante`);

        console.log('Respuesta de la API:', response.data);
        this.evaluacion = response.data.evaluacion || {};
        this.caso = response.data.caso || {};

        // Iniciar temporizador
        this.iniciarTemporizador();
      } catch (error) {
        console.error("Error al cargar evaluación:", error);

        let errorMsg = "Error al cargar la evaluación";
        if (error.response && error.response.data && error.response.data.message) {
          errorMsg = error.response.data.message;
        }

        // Si es error 401, manejo especial
        if (error.response && error.response.status === 401) {
          errorMsg = "Tu sesión ha expirado. Por favor inicia sesión nuevamente.";
          // Esperar un momento y redirigir al login
          setTimeout(() => {
            this.$router.push('/');
          }, 1500);
        }

        this.$q.notify({
          color: "negative",
          message: errorMsg,
          timeout: 3000,
        });

        // Volver a la página de evaluaciones pendientes
        setTimeout(() => {
          this.$router.push('/app/estudiantes/evaluaciones-pendientes');
        }, 3000);
      } finally {
        this.loading = false;
      }
    },

    iniciarTemporizador() {
      const actualizarTiempo = () => {
        const ahora = new Date();
        const fin = new Date(this.evaluacion.fecha_fin);

        // Si ya pasó la fecha de fin
        if (ahora >= fin) {
          clearInterval(this.timerInterval);
          this.tiempoRestante = "Finalizado";
          this.dialogTiempoAgotado = true;
          return;
        }

        // Calcular tiempo restante
        const diffMs = fin - ahora;
        const diffHrs = Math.floor(diffMs / 3600000);
        const diffMins = Math.floor((diffMs % 3600000) / 60000);
        const diffSecs = Math.floor((diffMs % 60000) / 1000);

        this.tiempoRestante = `${diffHrs.toString().padStart(2, '0')}:${diffMins.toString().padStart(2, '0')}:${diffSecs.toString().padStart(2, '0')}`;
      };

      // Actualizar inmediatamente
      actualizarTiempo();

      // Actualizar cada segundo
      this.timerInterval = setInterval(actualizarTiempo, 1000);
    },

    iniciarResolucion() {
      // Verificar que tengamos datos válidos
      if (!this.caso || !this.caso.id) {
        this.$q.notify({
          message: 'Error: No se pudo obtener la información del caso',
          color: 'negative',
          position: 'top'
        });
        return;
      }

      // Redirigir a la página de resolución del caso
      this.$router.push({
        path: '/app/estudiantes/resolver-caso',
        query: {
          id: this.caso.id,
          evaluacion: this.evaluacion.id
        }
      });
    },

    volverAEvaluaciones() {
      this.$router.push('/app/estudiantes/evaluaciones-pendientes');
    }
  }
};
</script>

<style scoped>
.evaluation-container {
  max-width: 800px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, sans-serif;
}

.inicio-caso-card {
  border-radius: 8px;
  background-color: white;
}

.info-card {
  border-radius: 8px;
  background-color: #f5f0ff;
}

.full-width-btn {
  width: 80%;
  margin: 0 auto;
  max-width: 400px;
  height: 50px;
  font-weight: 500;
  border-radius: 8px;
}

@media (max-width: 600px) {
  .full-width-btn {
    width: 100%;
  }
}
</style>
