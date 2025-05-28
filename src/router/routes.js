const routes = [
  // LOGIN + REGISTRO
  {
    path: "/",
    component: () => import("layouts/AuthLayout.vue"),
    children: [
      {
        path: "",
        name: "auth",
        component: () => import("pages/LoginRegistroPage.vue"),
        meta: { requiresAuth: false },
      },
      // Nueva ruta para cambiar contraseña en primer inicio de sesión
      {
        path: "cambiar-contrasena-inicial",
        name: "cambiar-contrasena-inicial",
        component: () => import("pages/CambiarContrasenaInicial.vue"),
        meta: { requiresAuth: true },
      },
    ],
  },

  // COMPLETAR PERFIL (Ya no se utiliza para nuevos usuarios, pero se mantiene por compatibilidad)
  {
    path: "/completar-perfil",
    component: () => import("layouts/AuthLayout.vue"),
    children: [
      {
        path: "",
        name: "completar-perfil",
        component: () => import("pages/CompletarPerfil.vue"),
        meta: { requiresAuth: true },
      },
    ],
  },

  // RUTAS PRIVADAS CON LAYOUT
  {
    path: "/app",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      // Común
      {
        path: "inicio",
        name: "inicio",
        component: () => import("pages/IndexPage.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: 'gestion-llaves',
        name: 'gestion-llaves',
        component: () => import('pages/GestionLlavesPage.vue')
      },

      // RUTA COMÚN PARA LISTA DE CASOS - Accesible para todos los roles
      {
        path: "lista-casos",
        name: "lista-casos-comun",
        component: () => import("pages/Docentes/ListaCasos.vue"),
        meta: { requiresAuth: true },
      },

      // DOCENTES
      {
        path: "docentes/crear-caso",
        name: "crear-caso",
        component: () => import("pages/Docentes/CrearCaso.vue"),
        meta: { requiresAuth: true, requiresDocente: true },
      },
      {
        path: "docentes/lista-casos",
        name: "lista-casos",
        component: () => import("pages/Docentes/ListaCasos.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "docentes/programar-examen",
        name: "programar-examen",
        component: () => import("pages/Docentes/CrearEvaluacion.vue"),
        meta: { requiresAuth: true, requiresDocente: true },
      },
      // NUEVA RUTA PARA VER EVALUACIONES DE DOCENTE
      {
        path: "docentes/mis-evaluaciones",
        name: "mis-evaluaciones",
        component: () => import("pages/Docentes/MisEvaluaciones.vue"),
        meta: { requiresAuth: true, requiresDocente: true },
      },
      // NUEVA RUTA PARA VER DETALLES DE UNA EVALUACIÓN
      {
        path: "docentes/detalle-evaluacion/:id",
        name: "detalle-evaluacion",
        component: () => import("pages/Docentes/DetalleEvaluacion.vue"),
        meta: { requiresAuth: true, requiresDocente: true },
        props: true,
      },

      // ESTUDIANTES
      {
        path: "estudiantes/resolver-caso",
        name: "resolver-caso",
        component: () => import("pages/estudiantes/ResolverCaso.vue"),
        meta: { requiresAuth: true },
      },
      // NUEVA RUTA PARA QUE ESTUDIANTES VEAN LISTA DE CASOS
      {
        path: "estudiantes/lista-casos",
        name: "estudiantes-lista-casos",
        component: () => import("pages/Docentes/ListaCasos.vue"),
        meta: { requiresAuth: true },
      },
      // NUEVAS RUTAS PARA ESTUDIANTES Y EVALUACIONES
      {
        path: "estudiantes/evaluaciones-pendientes",
        name: "evaluaciones-pendientes",
        component: () => import("pages/estudiantes/EvaluacionesPendientes.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "estudiantes/iniciar-evaluacion/:id",
        name: "iniciar-evaluacion",
        component: () => import("pages/estudiantes/IniciarEvaluacion.vue"),
        meta: { requiresAuth: true },
        props: true,
      },

      // RUTAS ACTUALIZADAS PARA REDIRECCIÓN
      {
        path: "evaluaciones-pendientes",
        redirect: "/app/estudiantes/evaluaciones-pendientes"
      },
      {
        path: "iniciar-evaluacion/:id",
        redirect: to => {
          return { path: `/app/estudiantes/iniciar-evaluacion/${to.params.id}` }
        }
      },

      // ADMINISTRACIÓN - NUEVAS RUTAS
      {
        path: "admin/gestiones",
        name: "admin-gestiones",
        component: () => import("pages/Admin/AdminGestiones.vue"),
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: "admin/grupos-materia",
        name: "admin-grupos-materia",
        component: () => import("pages/Admin/AdminGruposMateria.vue"),
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: "admin/asignacion-estudiantes",
        name: "admin-asignacion-estudiantes",
        component: () => import("pages/Admin/AdminAsignacionEstudiantes.vue"),
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      // NUEVA RUTA PARA IMPORTACIÓN DE USUARIOS
      {
        path: "admin/importar-usuarios",
        name: "admin-importar-usuarios",
        component: () => import("pages/Admin/ImportarUsuarios.vue"),
        meta: { requiresAuth: true, requiresAdmin: true },
      },
    ],
  },

  // 404
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
