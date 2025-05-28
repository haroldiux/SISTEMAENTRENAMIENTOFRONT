import { route } from 'quasar/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  // Protección de rutas
  Router.beforeEach((to, from, next) => {
    const isAuthenticated = !!localStorage.getItem('token')

    // Si la ruta requiere autenticación pero el usuario no está autenticado
    if (to.meta.requiresAuth && !isAuthenticated) {
      next({ name: 'auth' })
      return
    }

    // Si el usuario ya está autenticado e intenta ir a la página de login
    if (to.name === 'auth' && isAuthenticated) {
      next({ name: 'inicio' })
      return
    }

    // Si el usuario está autenticado, verificar si necesita cambiar su contraseña
    if (isAuthenticated) {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const user = JSON.parse(userStr)

        // Si es la primera vez que inicia sesión y no está en la página de cambio de contraseña
        if (user.primera_vez === true &&
          to.name !== 'cambiar-contrasena-inicial' &&
          to.name !== 'auth') {
          next({ name: 'cambiar-contrasena-inicial' })
          return
        }
      }
    }

    // Si la ruta requiere rol de administrador, verificar que el usuario sea administrador
    if (to.meta.requiresAdmin && isAuthenticated) {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const user = JSON.parse(userStr)
        if (user.role !== 'ADMINISTRADOR') {
          next({ name: 'inicio' })
          return
        }
      }
    }

    // Si intenta acceder a una ruta de docentes pero es estudiante
    if (to.path.includes('/docentes/') && isAuthenticated) {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const user = JSON.parse(userStr)
        if (user.role !== 'DOCENTE' && user.role !== 'ADMINISTRADOR') {
          next({ name: 'inicio' })
          return
        }
      }
    }

    // Si intenta acceder a una ruta de estudiantes pero es docente
    if (to.path.includes('/estudiantes/') && isAuthenticated) {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const user = JSON.parse(userStr)
        if (user.role !== 'ESTUDIANTE') {
          next({ name: 'inicio' })
          return
        }
      }
    }
    // Permitir la navegación si no se cumplen las condiciones anteriores
    next()
  })

  return Router
})
