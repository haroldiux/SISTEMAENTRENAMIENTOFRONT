<template>
  <q-dialog v-model="model">
    <q-card style="min-width: 500px; max-width: 90vw">
      <q-card-section class="q-pb-none">
        <div class="text-h6">Registrar nuevo parámetro</div>

        <q-input
          v-model="parametro"
          label="Nombre del parámetro"
          class="q-mt-sm text-uppercase"
          :rules="[val => !!val || 'Campo requerido']"
        />

        <q-select
          v-model="manifestacionSeleccionada"
          :options="opcionesManifestacionFiltradas"
          label="Manifestación"
          use-input
          map-options
          emit-value
          :option-label="(item) => item ? `${item.nombre} (${getTipoTexto(item.tipo)})` : ''"
          option-value="id"
          clearable
          input-debounce="0"
          input-class="text-uppercase"
          @filter="filtrarManifestaciones"
          @input-value="textoManifestacion = $event"
          class="q-mt-sm"
        />

        <q-select
          v-model="caracteristicaSeleccionada"
          :options="opcionesCaracteristicaFiltradas"
          label="Característica"
          use-input
          map-options
          emit-value
          option-label="clasificacion"
          option-value="id"
          clearable
          input-debounce="0"
          input-class="text-uppercase"
          @filter="filtrarCaracteristicas"
          @input-value="textoCaracteristica = $event"
          class="q-mt-sm"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" v-close-popup />
        <q-btn flat label="Guardar" color="primary" @click="guardar" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { api } from 'boot/axios'

const props = defineProps({
  modelValue: Boolean,
  manifestacionPreseleccionada: Number,
  caracteristicaPreseleccionada: Number
})
const emit = defineEmits(['update:modelValue', 'guardar'])

const model = ref(false)

watch(() => props.modelValue, async val => {
  model.value = val

  if (val) {
    await cargarOpciones()

    //Al abrir el modal NO autoseleccionamos nada
    manifestacionSeleccionada.value = null
    caracteristicaSeleccionada.value = null
    //Limpiar input también
    parametro.value = ''
    textoManifestacion.value = ''
    textoCaracteristica.value = ''
  }
})

watch(model, val => emit('update:modelValue', val))

const parametro = ref('')
const manifestacionSeleccionada = ref(null)
const caracteristicaSeleccionada = ref(null)
const textoManifestacion = ref('')
const textoCaracteristica = ref('')

const opcionesManifestacion = ref([])
const opcionesCaracteristica = ref([])
const opcionesManifestacionFiltradas = ref([])
const opcionesCaracteristicaFiltradas = ref([])

async function cargarOpciones() {
  const [manifestaciones, caracteristicas] = await Promise.all([
    api.get('/manifestaciones'),
    api.get('/caracteristicas')
  ])

  // Filtrar manifestaciones tipo 1 o 2
  opcionesManifestacion.value = manifestaciones.data.filter(m => m.tipo === 1 || m.tipo === 2)
  opcionesManifestacionFiltradas.value = [...opcionesManifestacion.value]

  opcionesCaracteristica.value = caracteristicas.data
  opcionesCaracteristicaFiltradas.value = [...opcionesCaracteristica.value]

  manifestacionSeleccionada.value = props.manifestacionPreseleccionada || null
  caracteristicaSeleccionada.value = props.caracteristicaPreseleccionada || null
}

function getTipoTexto(tipo) {
  return tipo === 1 ? 'SIGNO' : tipo === 2 ? 'SÍNTOMA' : 'OTRO'
}

function filtrarManifestaciones(val, update) {
  const texto = (val || '').toUpperCase()
  textoManifestacion.value = val

  update(() => {
    if (texto === '') {
      opcionesManifestacionFiltradas.value = [...opcionesManifestacion.value]
    } else {
      opcionesManifestacionFiltradas.value = opcionesManifestacion.value.filter(item => {
        const nombreCompleto = `${item.nombre} ${getTipoTexto(item.tipo)}`.toUpperCase()
        return nombreCompleto.includes(texto)
      })
    }
    return opcionesManifestacionFiltradas.value
  })
}

function filtrarCaracteristicas(val, update) {
  const texto = (val || '').toUpperCase()
  textoCaracteristica.value = val

  update(() => {
    if (texto === '') {
      opcionesCaracteristicaFiltradas.value = [...opcionesCaracteristica.value]
    } else {
      opcionesCaracteristicaFiltradas.value = opcionesCaracteristica.value.filter(item => {
        return item.clasificacion.toUpperCase().includes(texto)
      })
    }
    return opcionesCaracteristicaFiltradas.value
  })
}

async function guardar() {
  const nuevo = parametro.value.trim().toUpperCase()
  if (!nuevo) return

  try {
    const res = await api.post('/variables', {
      parametro: nuevo,
      manifestacion_id: manifestacionSeleccionada.value,
      caracteristica_id: caracteristicaSeleccionada.value
    })

    emit('guardar', res.data.variable) // devuelve todo el objeto guardado
    emit('update:modelValue', false)
    parametro.value = ''
  } catch (error) {
    console.error('Error al registrar el parámetro:', error)
  }
}

onMounted(() => {
  cargarOpciones()

  window.addEventListener('actualizar-manifestaciones', (e) => {
    cargarOpciones().then(() => {
      if (e.detail?.id) {
        manifestacionSeleccionada.value = e.detail.id
      }
    })
  })
})
onUnmounted(() => {
  window.removeEventListener('actualizar-manifestaciones', cargarOpciones)
})
</script>

<style scoped>
.text-uppercase input {
  text-transform: uppercase;
}
</style>
