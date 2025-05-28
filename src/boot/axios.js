import { boot } from 'quasar/wrappers'
import axios from 'axios'
import { Notify } from 'quasar'
import { useAuthStore } from 'src/stores/auth'

// URL base para la API
const API_URL = 'http://localhost:8000/api'

// URL base para archivos de storage
const STORAGE_URL = 'http://localhost:8000/storage'

// Crear instancia de axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  },
   withCredentials: true // Añade esta línea
})

// Interceptor para agregar token de autenticación a las solicitudes
api.interceptors.request.use(config => {
  // Intentar obtener el token desde localStorage
  const token = localStorage.getItem('token')

  if (token) {
    // Asegurarse de que exista el objeto headers
    if (!config.headers) {
      config.headers = {}
    }
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
}, error => {
  // Manejar el error en la solicitud
  console.error('Error en la solicitud:', error)
  return Promise.reject(error)
})

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  // Respuesta exitosa
  response => response,
  // Error en la respuesta
  error => {
    const { response } = error

    // Verificar si es un error de autenticación
    if (response && response.status === 401) {
      Notify.create({
        message: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
        color: 'negative',
        position: 'top',
        timeout: 5000
      })

      // Obtener store de autenticación y cerrar sesión
      const authStore = useAuthStore()
      if (authStore) {
        authStore.logout()
      } else {
        // Fallback en caso de que el store no esté disponible
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('docente_id')
        localStorage.removeItem('estudiante_id')

        // Redireccionar a login
        window.location.href = '/'
      }
    }

    return Promise.reject(error)
  }
)

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
  app.config.globalProperties.$storage = STORAGE_URL
})

// Exportamos todo lo que necesitemos
export { api, STORAGE_URL }
