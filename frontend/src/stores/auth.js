import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  buscarPerfil,
  criarConta,
  entrarComEmail,
  obterSessao,
  observarSessao,
  sair,
} from '@/services/auth'
import { isSupabaseConfigured } from '@/services/supabase'

export const useAuthStore = defineStore('auth', () => {
  const session = ref(null)
  const user = ref(null)
  const profile = ref(null)
  const ready = ref(false)

  const isAuthenticated = computed(() => !!user.value)
  const displayName = computed(
    () => profile.value?.name || user.value?.user_metadata?.name || user.value?.email || '',
  )

  let initPromise = null

  async function carregarPerfil() {
    if (!user.value) {
      profile.value = null
      return
    }
    try {
      profile.value = await buscarPerfil(user.value.id)
    } catch {
      profile.value = null
    }
  }

  function aplicarSessao(novaSessao) {
    const mudouUsuario = novaSessao?.user?.id !== user.value?.id
    session.value = novaSessao
    user.value = novaSessao?.user ?? null
    if (mudouUsuario) carregarPerfil()
  }

  function init() {
    if (initPromise) return initPromise

    initPromise = (async () => {
      try {
        aplicarSessao(await obterSessao())
      } catch {
        aplicarSessao(null)
      }
      observarSessao((_evento, novaSessao) => aplicarSessao(novaSessao))
      ready.value = true
    })()

    return initPromise
  }

  async function login({ email, password }) {
    const resultado = await entrarComEmail({ email, password })
    aplicarSessao(resultado.session)
    return resultado
  }

  async function register({ name, email, password }) {
    const resultado = await criarConta({ name, email, password })
    if (resultado.session) aplicarSessao(resultado.session)
    return resultado
  }

  async function logout() {
    try {
      await sair()
    } finally {
      aplicarSessao(null)
    }
  }

  return {
    session,
    user,
    profile,
    ready,
    isAuthenticated,
    displayName,
    isConfigured: isSupabaseConfigured,
    init,
    login,
    register,
    logout,
    refreshProfile: carregarPerfil,
  }
})
