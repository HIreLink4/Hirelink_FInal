import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authAPI } from '../services/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (phone, password) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authAPI.login({ phone, password })
          const { accessToken, refreshToken, user } = response.data.data

          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', refreshToken)

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          })

          return { success: true }
        } catch (error) {
          const message = error.response?.data?.message || 'Login failed'
          set({ error: message, isLoading: false })
          return { success: false, error: message }
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authAPI.register(userData)
          const { accessToken, refreshToken, user } = response.data.data

          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', refreshToken)

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          })

          return { success: true }
        } catch (error) {
          const message = error.response?.data?.message || 'Registration failed'
          set({ error: message, isLoading: false })
          return { success: false, error: message }
        }
      },

      logout: () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        })
      },

      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } })
      },

      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
