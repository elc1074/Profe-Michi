import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  buscarPerfil,
  criarConta,
  excluirConta,
  entrarComEmail,
  entrarComGoogle,
  obterSessao,
  observarSessao,
  sair,
} from '@/services/auth'
import { isSupabaseConfigured } from '@/services/supabase'

const GUEST_KEY = 'profe-michi-guest'

export const useAuthStore = defineStore('auth', () => {
  const session = ref(null)
  const user = ref(null)
  const profile = ref(null)
  const ready = ref(false)
  const isGuest = ref(sessionStorage.getItem(GUEST_KEY) === '1')

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
    if (user.value) definirVisitante(false)
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

  function definirVisitante(valor) {
    isGuest.value = valor
    if (valor) sessionStorage.setItem(GUEST_KEY, '1')
    else sessionStorage.removeItem(GUEST_KEY)
  }

  // Visitante usa o site sem conta
  // nada é salvo no banco
  function continueAsGuest() {
    definirVisitante(true)
  }

  async function loginWithGoogle({ redirectTo }) {
    await entrarComGoogle({ redirectTo })
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

  async function deleteAccount() {
    await excluirConta()

    // A conta já não existe no servidor; limpamos a sessão local mesmo se o
    // signOut remoto responder com erro por causa da exclusão.
    try {
      await sair()
    } catch {
      // A remoção foi concluída; apenas a invalidação remota da sessão falhou.
    } finally {
      aplicarSessao(null)
    }
  }

  return {
    session,
    user,
    profile,
    ready,
    isGuest,
    isAuthenticated,
    displayName,
    isConfigured: isSupabaseConfigured,
    init,
    login,
    loginWithGoogle,
    continueAsGuest,
    register,
    logout,
    deleteAccount,
    refreshProfile: carregarPerfil,
  }
})
