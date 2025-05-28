<template>
  <q-page class="q-pa-md bg-grey-1">
    <!-- Overlay de carga -->
    <div v-if="cargando" class="fullscreen column flex-center bg-grey-3" style="z-index: 9999; opacity: 0.9">
      <q-spinner color="primary" size="5em" />
      <div class="text-primary text-h6 q-mt-md">
        Cargando datos del sistema...
      </div>
      <div class="text-grey q-mt-sm">
        Por favor espere mientras se prepara el formulario
      </div>
    </div>

    <q-card class="q-pa-lg shadow-2" :class="{ 'disabled-card': cargando }">
      <q-card-section class="text-h6 text-primary">Crear Caso Clínico</q-card-section>

      <q-form @submit.prevent="guardarCaso" class="q-gutter-md">
        <!-- MATERIA -->
        <q-select class="materia-select" filled v-model="materiaSeleccionada" use-input clearable input-debounce="300"
          :options="materiasFiltradas" option-label="nombre" option-value="id" emit-value map-options
          label="Buscar materia existente" @filter="filtrarMaterias" :disable="cargando" />

        <!-- NIVEL DE DIFICULTAD -->
        <q-select filled v-model="nivelDificultad" :options="niveles" label="Nivel de dificultad"
          :option-label="'label'" :option-value="'value'" emit-value map-options :rules="[
            (val) =>
              (val !== null && val !== undefined) ||
              'Este campo es obligatorio',
          ]" :disable="cargando" />

        <!-- TIEMPOS -->
        <div class="row q-col-gutter-sm">
          <div class="col-12 col-md-6">
            <q-input filled dense v-model.number="tiempoVisualizacion" type="number"
              label="⏳ Tiempo de visualización (min)" :rules="[(val) => val > 0 || 'Mayor a 0']"
              :disable="lecturaIlimitada || cargando" />
          </div>
          <div class="col-12 col-md-6">
            <q-input filled dense v-model.number="tiempoResolucion" type="number" label="⏱ Tiempo para resolver (min)"
              :rules="[(val) => val > 0 || 'Mayor a 0']" :disable="cargando" />
          </div>
        </div>

        <!-- TOGGLE DE LECTURA ILIMITADA -->
        <div class="row q-mt-sm items-center">
          <div class="col-auto flex items-center">
            <q-toggle v-model="lecturaIlimitada" color="primary" :disable="cargando" />
            <span class="q-ml-sm text-subtitle2">Lectura ilimitada</span>
          </div>
          <div class="col text-caption text-grey-7">
            Activa esta opción si el estudiante puede leer el caso clínico sin
            límite de tiempo.
          </div>
        </div>

        <!-- TÍTULO E HISTORIA -->
        <q-input filled v-model="titulo" label="Título del caso" :rules="[(val) => !!val || 'Requerido']"
          @update:model-value="(val) => (titulo = val.toUpperCase())" :disable="cargando" />
        <q-input filled v-model="enunciado" label="Enunciado del caso clínico" type="textarea" autogrow
          :rules="[(val) => !!val || 'Requerido']" @update:model-value="(val) => (enunciado = val.toUpperCase())"
          :disable="cargando" />

        <!-- MOTIVO DE CONSULTA -->
        <q-select class="motivo-select" filled v-model="motivoTemporal" use-input clearable input-debounce="300"
          :options="motivosFiltrados" option-label="nombre" label="Buscar motivo de consulta existente"
          @filter="filtrarMotivos" :disable="cargando" />

        <div class="row q-col-gutter-sm q-mt-sm">
          <q-btn outline icon="add" label="Añadir nuevo motivo" color="primary" class="col" @click="modalMotivo = true"
            :disable="cargando" />
          <q-btn outline icon="check" label="Añadir a resolución" color="secondary" class="col"
            :disable="!motivoTemporal || cargando" @click="agregarMotivoSeleccionado" />
        </div>

        <q-chip v-for="(m, i) in motivosSeleccionados" :key="i" color="primary" text-color="white"
          class="q-mt-sm q-mr-sm" removable @remove="motivosSeleccionados.splice(i, 1)" :disable="cargando">
          {{ typeof m === "object" ? m.nombre : m }}
        </q-chip>

        <ModalNuevoMotivo v-model="modalMotivo" @guardar="guardarMotivoDesdeModal" />

        <!-- COMPONENTES CLÍNICOS -->
        <ElementoClinico titulo="Signos" v-model="signos" :opciones="opcionesClinicas"
          :caracteristicas="caracteristicas" :parametros="parametros" @update:caracteristicas="caracteristicas = $event"
          @actualizar-manifestaciones="cargarManifestaciones" :soloLectura="cargando" />

        <ElementoClinico titulo="Síntomas" v-model="sintomas" :opciones="opcionesClinicas"
          :caracteristicas="caracteristicas" :parametros="parametros" @update:caracteristicas="caracteristicas = $event"
          @actualizar-manifestaciones="cargarManifestaciones" :soloLectura="cargando" />

        <ElementoClinico titulo="Síndromes" v-model="sindromes" :opciones="opcionesClinicas" :soloLectura="cargando" />

        <!-- EXÁMENES COMPLEMENTARIOS -->
        <ExamenesComplementarios v-model="examenesSeleccionados" v-model:archivos="archivosAdjuntos"
          ref="examenesComplementariosRef" :soloLectura="cargando" />

        <!-- DIAGNÓSTICO -->
        <DiagnosticoCreacion v-model="diagnostico" :soloLectura="cargando" ref="diagnosticoRef" />

        <!-- TRATAMIENTO -->
        <TratamientoCreacion v-model="tratamientos" :soloLectura="cargando" ref="tratamientoRef" />

        <!-- GUARDAR -->
        <div class="row q-col-gutter-sm q-mt-lg">
          <div class="col">
            <q-btn label="Limpiar Formulario" icon="clear" color="grey" outline @click="limpiarFormulario"
              :disable="cargando" class="full-width" />
          </div>
          <div class="col">
            <q-btn label="Guardar Caso" icon="save" type="submit" color="primary" class="full-width" :disable="cargando"
              :loading="guardando" />
          </div>
        </div>
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted } from "vue";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import { api } from "boot/axios";
import ElementoClinico from "src/components/forms/ElementoClinico.vue";
import ModalNuevoMotivo from "src/components/modals/ModalNuevoMotivo.vue";
import ExamenesComplementarios from "src/components/forms/ExamenesComplementarios.vue";
import DiagnosticoCreacion from "src/components/forms/DiagnosticoCreacion.vue";
import TratamientoCreacion from "src/components/forms/TratamientoCreacion.vue";

// Nueva variable para controlar estado de carga
const cargando = ref(true);
const guardando = ref(false);

const $q = useQuasar();
const router = useRouter();
const userData = JSON.parse(localStorage.getItem("user") || "{}");
if (userData.role !== "DOCENTE") {
  $q.notify({
    type: "negative",
    message: "Error: Solo los docentes pueden crear casos clínicos.",
    position: "top",
  });
}

const docenteId = localStorage.getItem("docente_id");
if (!docenteId) {
  $q.notify({
    type: "negative",
    message:
      "Error: No se encontró ID de docente. Por favor, inicie sesión nuevamente.",
    position: "top",
  });
}

// Campos base
const titulo = ref("");
const enunciado = ref("");
const tiempoVisualizacion = ref("");
const tiempoResolucion = ref("");
const nivelDificultad = ref(null);
const niveles = [
  { label: "Básico", value: 0 },
  { label: "Intermedio", value: 1 },
  { label: "Avanzado", value: 2 },
];
const lecturaIlimitada = ref(false);

// Materias
const materias = ref([]);
const materiasFiltradas = ref([]);
const materiaSeleccionada = ref(null);

// Referencias para diagnóstico y tratamiento
const diagnostico = ref("");
const tratamientos = ref([]);
const diagnosticoRef = ref(null);
const tratamientoRef = ref(null);

async function cargarMaterias() {
  try {
    const { data } = await api.get("/materias");
    materias.value = data;
    materiasFiltradas.value = [...materias.value];
    return true;
  } catch (err) {
    console.error("Error cargando materias:", err);
    return false;
  }
}

function filtrarMaterias(val, update) {
  if (cargando.value) return;

  const texto = typeof val === "string" ? val.toLowerCase() : "";
  update(() => {
    materiasFiltradas.value = materias.value.filter((m) =>
      m.nombre.toLowerCase().includes(texto)
    );
  });
}

// Cargar manifestaciones
async function cargarManifestaciones() {
  try {
    const { data } = await api.get("/manifestaciones");
    manifestaciones.value = data;
    opcionesClinicas.descripcion = data.map((m) => m.nombre);
    return true;
  } catch (error) {
    console.error("Error al cargar manifestaciones:", error);
    return false;
  }
}

// Motivos de consulta
const motivos = ref([]);
const motivosFiltrados = ref([]);
const motivosSeleccionados = ref([]);
const motivoTemporal = ref("");
const modalMotivo = ref(false);
const caracteristicas = ref([]);
const parametros = ref([]);
const localizaciones = ref([]);
const examenes = ref([]);
const examenesComplementariosRef = ref(null);

async function cargarMotivos() {
  try {
    const { data } = await api.get("/motivos");
    motivos.value = data;
    motivosFiltrados.value = [...motivos.value];
    return true;
  } catch (err) {
    console.error("Error cargando motivos:", err);
    return false;
  }
}

function filtrarMotivos(val, update) {
  if (cargando.value) return;

  const texto = typeof val === "string" ? val.toLowerCase() : "";
  update(() => {
    motivosFiltrados.value = motivos.value.filter((m) =>
      m.nombre.toLowerCase().includes(texto)
    );
  });
}

async function guardarMotivoDesdeModal(nuevo) {
  if (cargando.value) return;

  const nuevoValor = (nuevo || "").trim();
  if (!nuevoValor) return;

  try {
    const res = await api.post("/motivos", { nombre: nuevoValor });
    const motivoGuardado = res.data.motivo;

    motivos.value.push(motivoGuardado);
    motivosFiltrados.value = [...motivos.value];

    motivoTemporal.value = motivoGuardado;
    agregarMotivoSeleccionado();

    $q.notify({
      type: "positive",
      message: "Motivo guardado correctamente",
    });
  } catch (err) {
    console.error("Error al guardar motivo:", err);
    $q.notify({ type: "negative", message: "Error al guardar motivo" });
  }
}

function agregarMotivoSeleccionado() {
  if (cargando.value) return;

  if (!motivoTemporal.value) return;

  let motivo;

  if (
    typeof motivoTemporal.value === "object" &&
    motivoTemporal.value !== null
  ) {
    motivo = motivoTemporal.value;
  } else {
    const motivoEncontrado = motivos.value.find(
      (m) => m.nombre === motivoTemporal.value || m === motivoTemporal.value
    );

    motivo = motivoEncontrado || { nombre: motivoTemporal.value };
  }

  const yaExiste = motivosSeleccionados.value.some((m) => {
    if (typeof m === "object") return m.nombre === motivo.nombre;
    return m === motivo.nombre;
  });

  if (!yaExiste) {
    motivosSeleccionados.value.push(motivo);
  }

  motivoTemporal.value = null;
  nextTick(() => {
    const el = document.querySelector(".motivo-select input");
    if (el) el.value = "";
  });
}

// Componentes clínicos
const signos = ref([]);
const sintomas = ref([]);
const sindromes = ref([]);
const opcionesClinicas = reactive({
  descripcion: [],
  categoria: [],
  subcategoria: [],
  localizacion: [],
  parametros: [],
});
const manifestaciones = ref([]);

function actualizarManifestaciones(nueva) {
  if (cargando.value) return;

  if (!manifestaciones.value.includes(nueva)) {
    manifestaciones.value.push(nueva);
  }
}

async function cargarCaracteristicas() {
  try {
    const { data } = await api.get("/caracteristicas");
    caracteristicas.value = data.map((c) => c.clasificacion);
    return true;
  } catch (error) {
    console.error("Error al cargar características:", error);
    return false;
  }
}

async function cargarParametros() {
  try {
    const { data } = await api.get("/variables");
    parametros.value = data;
    opcionesClinicas.parametros = data;
    return true;
  } catch (err) {
    console.error("Error al cargar parámetros:", err);
    return false;
  }
}

async function cargarLocalizaciones() {
  try {
    const { data } = await api.get("/localizaciones");
    localizaciones.value = data;
    opcionesClinicas.localizacion = data.map((loc) => loc.nombre);
    return true;
  } catch (err) {
    console.error("Error al cargar localizaciones:", err);
    $q.notify({ type: "negative", message: "Error al cargar localizaciones" });
    return false;
  }
}

async function cargarExamenes() {
  try {
    const { data } = await api.get("/examenes");
    examenes.value = data;
    return true;
  } catch (error) {
    console.error("Error al cargar exámenes:", error);
    return false;
  }
}

function obtenerIdManifestacion(nombre) {
  const manifestacion = manifestaciones.value.find((m) => m.nombre === nombre);

  if (manifestacion) {
    return manifestacion.id;
  } else {
    console.error(`❌ No se encontró ID para la manifestación: ${nombre}`);
    return null;
  }
}

function obtenerIdLocalizacion(nombreLocalizacion) {
  if (!nombreLocalizacion) return null;

  const localizacion = localizaciones.value.find(
    (l) => l.nombre.toUpperCase() === nombreLocalizacion.toUpperCase()
  );

  if (localizacion) {
    return localizacion.id;
  } else {
    console.error(
      `❌ No se encontró ID para la localización: ${nombreLocalizacion}`
    );
    return null;
  }
}

function obtenerIdExamen(nombreExamen) {
  const examen = examenes.value.find((e) => e.nombre === nombreExamen);
  return examen?.id || null;
}

function obtenerIdMotivo(nombreMotivo) {
  const motivo = motivos.value.find((m) => m.nombre === nombreMotivo);
  return motivo?.id || null;
}

// EXAMENES
const examenesSeleccionados = ref([]);
const archivosAdjuntos = ref({});

function limpiarFormulario() {
  // Confirmar antes de limpiar
  $q.dialog({
    title: 'Confirmar',
    message: '¿Está seguro de que desea limpiar todo el formulario?',
    cancel: true,
    persistent: false
  }).onOk(() => {
    titulo.value = "";
    enunciado.value = "";
    tiempoVisualizacion.value = "";
    tiempoResolucion.value = "";
    nivelDificultad.value = null;
    lecturaIlimitada.value = false;
    materiaSeleccionada.value = null;
    motivosSeleccionados.value = [];
    motivoTemporal.value = "";
    signos.value = [];
    sintomas.value = [];
    sindromes.value = [];
    examenesSeleccionados.value = [];
    diagnostico.value = "";
    tratamientos.value = [];
    Object.keys(archivosAdjuntos.value).forEach(
      (key) => delete archivosAdjuntos.value[key]
    );

    $q.notify({
      type: "positive",
      message: "Formulario limpiado correctamente",
      icon: "check",
    });
  });
}

async function guardarCaso() {
  if (cargando.value) return;

  if (!docenteId) {
    $q.notify({
      type: "negative",
      message:
        "Error: No se encontró ID de docente. Por favor, inicie sesión nuevamente.",
    });
    return;
  }

  // Validar campos obligatorios
  if (
    materiaSeleccionada.value == null ||
    nivelDificultad.value == null ||
    !titulo.value.trim() ||
    !enunciado.value.trim() ||
    !tiempoResolucion.value ||
    motivosSeleccionados.value.length === 0
  ) {
    $q.notify({
      type: "negative",
      message: "Por favor completa todos los campos obligatorios",
    });
    return;
  }

  const manifestacionesSinId = [];

  // Verificar signos
  signos.value.forEach((signo) => {
    if (signo.casoclinico && !obtenerIdManifestacion(signo.casoclinico)) {
      manifestacionesSinId.push(`Signo: ${signo.casoclinico}`);
    }
  });

  // Verificar síntomas
  sintomas.value.forEach((sintoma) => {
    if (sintoma.casoclinico && !obtenerIdManifestacion(sintoma.casoclinico)) {
      manifestacionesSinId.push(`Síntoma: ${sintoma.casoclinico}`);
    }
  });

  // Verificar síndromes
  sindromes.value.forEach((sindrome) => {
    if (sindrome.casoclinico && !obtenerIdManifestacion(sindrome.casoclinico)) {
      manifestacionesSinId.push(`Síndrome: ${sindrome.casoclinico}`);
    }
  });

  // Mostrar error si hay manifestaciones sin ID
  if (manifestacionesSinId.length > 0) {
    $q.notify({
      type: "negative",
      message: `No se encontraron IDs para algunas manifestaciones: ${manifestacionesSinId.join(
        ", "
      )}`,
      timeout: 5000,
    });
    console.error("Manifestaciones sin ID:", manifestacionesSinId);
    return;
  }

  // Formatear datos según lo que espera el controlador CasoController@store
  const payload = {
    titulo: titulo.value,
    nivel_dificultad: nivelDificultad.value,
    enunciado: enunciado.value,
    diagnostico: diagnostico.value.trim() || null,
    materia_id: materiaSeleccionada.value,
    docente_id: parseInt(docenteId),

    // Configuración (1 sola por caso)
    configuracion: {
      tiempo_resolucion: parseInt(tiempoResolucion.value),
      tiempo_vista_enunciado: lecturaIlimitada.value
        ? 0
        : parseInt(tiempoVisualizacion.value),
      tipo: lecturaIlimitada.value ? 1 : 0,
    },

    // Motivos
    caso_motivos: motivosSeleccionados.value.map((motivo) => {
      if (typeof motivo === "object" && motivo !== null) {
        return {
          motivo_id: motivo.id,
        };
      } else {
        const motivoObj = motivos.value.find(
          (m) => m.nombre === motivo || m === motivo
        );
        return {
          motivo_id: motivoObj?.id || null,
        };
      }
    }),

    // Presentación (manifestaciones) - combinando signos y síntomas
    presentas: [
      // Signos
      ...signos.value
        .filter((s) => s.casoclinico)
        .map((signo) => ({
          manifestacion_id: obtenerIdManifestacion(signo.casoclinico),
          localizacion_id: signo.localizacion
            ? obtenerIdLocalizacion(signo.localizacion)
            : null,
          variable_id: signo.parametro?.id ?? null,
        })),

      // Síntomas
      ...sintomas.value
        .filter((s) => s.casoclinico)
        .map((sintoma) => ({
          manifestacion_id: obtenerIdManifestacion(sintoma.casoclinico),
          localizacion_id: sintoma.localizacion
            ? obtenerIdLocalizacion(sintoma.localizacion)
            : null,
          variable_id: sintoma.parametro?.id ?? null,
        })),

      // Síndromes
      ...sindromes.value
        .filter((s) => s.casoclinico)
        .map((sindrome) => ({
          manifestacion_id: obtenerIdManifestacion(sindrome.casoclinico),
          localizacion_id: null,
          variable_id: null,
        })),
    ],

    // Exámenes complementarios
    examenes_complementarios: examenesSeleccionados.value.map((examen) => {
      const examenId =
        examenesComplementariosRef.value?.obtenerIdExamen(examen) || null;
      const archivoInfo = archivosAdjuntos.value[examen] ?? null;

      return {
        examen_id: examenId,
        archivo: archivoInfo,
      };
    }),

    // Tratamientos
    tratamientos: tratamientoRef.value?.obtenerDatosParaEnvio() || [],
  };

  console.log("Enviando datos:", payload);

  // Mostrar indicador de carga durante el guardado
  guardando.value = true;

  try {
    const response = await api.post("/casos", payload);

    $q.notify({
      type: "positive",
      message: "Caso clínico guardado correctamente",
      timeout: 3000,
      actions: [
        {
          label: 'Ver casos',
          color: 'white',
          handler: () => {
            router.push({ name: 'lista-casos' });
          }
        }
      ]
    });

    console.log("Respuesta:", response.data);

    // Limpiar formulario después de guardar exitosamente
    limpiarFormularioSinConfirmar();

    return response.data;
  } catch (error) {
    console.error("Error al guardar el caso:", error);

    let mensaje = "Error al guardar el caso";

    // Intentar extraer mensaje de error del backend
    if (error.response?.data?.error) {
      mensaje = error.response.data.error;
    } else if (error.response?.data?.message) {
      mensaje = error.response.data.message;
    } else if (error.response?.data?.details) {
      mensaje = `Error: ${error.response.data.details}`;
    }

    $q.notify({
      type: "negative",
      message: mensaje,
      timeout: 8000,
      actions: [{ label: "Cerrar", color: "white" }],
    });
  } finally {
    guardando.value = false;
  }
}

// Función para limpiar sin confirmación (después de guardar)
function limpiarFormularioSinConfirmar() {
  titulo.value = "";
  enunciado.value = "";
  tiempoVisualizacion.value = "";
  tiempoResolucion.value = "";
  nivelDificultad.value = null;
  lecturaIlimitada.value = false;
  materiaSeleccionada.value = null;
  motivosSeleccionados.value = [];
  motivoTemporal.value = "";
  signos.value = [];
  sintomas.value = [];
  sindromes.value = [];
  examenesSeleccionados.value = [];
  diagnostico.value = "";
  tratamientos.value = [];
  Object.keys(archivosAdjuntos.value).forEach(
    (key) => delete archivosAdjuntos.value[key]
  );
}

// Nueva función para cargar todos los datos de forma asíncrona y paralela
async function cargarTodosDatos() {
  cargando.value = true;

  try {
    const resultados = await Promise.all([
      cargarMaterias(),
      cargarMotivos(),
      cargarCaracteristicas(),
      cargarParametros(),
      cargarLocalizaciones(),
      cargarExamenes(),
      cargarManifestaciones(),
    ]);

    const todoCompletado = resultados.every((resultado) => resultado === true);

    if (!todoCompletado) {
      $q.notify({
        type: "warning",
        message:
          "Algunos datos no se pudieron cargar correctamente. Algunas funciones pueden no estar disponibles.",
        timeout: 5000,
      });
    } else {
      console.log("✅ Todos los datos cargados correctamente");
    }
  } catch (error) {
    console.error("Error al cargar datos:", error);
    $q.notify({
      type: "negative",
      message:
        "Error al cargar datos del sistema. Por favor, recargue la página.",
      timeout: 0,
      actions: [
        {
          label: "Recargar",
          color: "white",
          handler: () => {
            window.location.reload();
          },
        },
      ],
    });
  } finally {
    setTimeout(() => {
      cargando.value = false;
      console.log("Estado de carga desactivado");

      nextTick(() => {
        cargarManifestaciones().then(() => {
          console.log(
            "Manifestaciones recargadas después de completar carga inicial"
          );
        });
      });
    }, 500);
  }
}

onMounted(async () => {
  await cargarTodosDatos();

  // Listeners para eventos globales
  window.addEventListener("actualizar-localizaciones", (event) => {
    if (cargando.value) return;

    const nuevaLocalizacion = event.detail;

    if (nuevaLocalizacion) {
      if (typeof nuevaLocalizacion === "object" && nuevaLocalizacion.id) {
        if (!opcionesClinicas.localizacion.includes(nuevaLocalizacion.nombre)) {
          opcionesClinicas.localizacion.push(nuevaLocalizacion.nombre);
        }

        const yaExiste = localizaciones.value.some(
          (loc) => loc.id === nuevaLocalizacion.id
        );
        if (!yaExiste) {
          localizaciones.value.push(nuevaLocalizacion);
        }
      } else if (typeof nuevaLocalizacion === "string") {
        if (!opcionesClinicas.localizacion.includes(nuevaLocalizacion)) {
          opcionesClinicas.localizacion.push(nuevaLocalizacion);
        }
      }
    }
  });

  window.addEventListener("manifestacion-creada-global", (event) => {
    if (cargando.value) return;

    const nuevaManifestacion = event.detail;
    if (nuevaManifestacion && nuevaManifestacion.id) {
      const yaExiste = manifestaciones.value.some(
        (m) => m.id === nuevaManifestacion.id
      );
      if (!yaExiste) {
        manifestaciones.value.push(nuevaManifestacion);
      }
    }
  });
});
</script>

<style scoped>
.disabled-card {
  pointer-events: none;
  opacity: 0.7;
}

/* Mejoras visuales */
.q-form {
  max-width: 100%;
}

.q-card {
  border-radius: 12px;
}

.q-btn {
  border-radius: 8px;
}

/* Animaciones suaves */
.q-chip {
  transition: all 0.3s ease;
}

.q-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Responsivo */
@media (max-width: 600px) {
  .q-card {
    margin: 8px;
    padding: 8px !important;
  }

  .row.q-col-gutter-sm {
    margin: 0;
  }

  .col {
    padding: 4px;
  }
}
</style>
