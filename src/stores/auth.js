import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user') || '{}')
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => state.user.role || null,
    estudiante: (state) => {
      if (state.user && state.user.estudiante_id) {
        return {
          id: state.user.estudiante_id,
          nombre: state.user.name
        };
      }
      return null;
    },
    docente: (state) => {
      if (state.user && state.user.docente_id) {
        return {
          id: state.user.docente_id,
          nombre: state.user.name
        };
      }
      return null;
    }
  },

  actions: {
    setToken(token) {
      this.token = token;
      localStorage.setItem('token', token);
    },

    setUser(user) {
      this.user = user;
      localStorage.setItem('user', JSON.stringify(user));
    },

    logout() {
      this.token = null;
      this.user = {};
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('docente_id');
      localStorage.removeItem('estudiante_id');
    }
  }
});
