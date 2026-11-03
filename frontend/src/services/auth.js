import i18n from '../i18n'
import { supabase, isSupabaseConfigured } from './supabase'

function erroTraduzido(chave) {
  return new Error(i18n.global.t(chave))
}

function exigirSupabase() {
  if (!isSupabaseConfigured) throw erroTraduzido('error.auth.notConfigured')
  return supabase
}

function traduzirErroAuth(erro) {
  // Mantém o erro original disponível para suporte sem exibi-lo ao estudante.
  console.error('Supabase auth failed', erro)

  const codigo = erro?.code ?? ''
  const mensagem = erro?.message ?? ''

  if (codigo === 'invalid_credentials' || /invalid login credentials/i.test(mensagem)) {
    return erroTraduzido('error.auth.invalidCredentials')
  }
  if (codigo === 'email_not_confirmed' || /email not confirmed/i.test(mensagem)) {
    return erroTraduzido('error.auth.emailNotConfirmed')
  }
  if (codigo === 'user_already_exists' || /already registered/i.test(mensagem)) {
    return erroTraduzido('error.auth.userAlreadyExists')
  }
  if (codigo === 'weak_password' || /password should be/i.test(mensagem)) {
    return erroTraduzido('error.auth.weakPassword')
  }
  if (codigo === 'email_address_invalid' || codigo === 'validation_failed') {
    return erroTraduzido('error.auth.invalidEmail')
  }
  if (codigo === 'over_request_rate_limit' || codigo === 'over_email_send_rate_limit' || erro?.status === 429) {
    return erroTraduzido('error.auth.rateLimited')
  }
  if (erro instanceof TypeError || /failed to fetch|network/i.test(mensagem)) {
    return erroTraduzido('error.auth.connection')
  }
  return erroTraduzido('error.auth.generic')
}

async function executar(operacao) {
  let resultado
  try {
    resultado = await operacao()
  } catch (erro) {
    throw traduzirErroAuth(erro)
  }
  if (resultado.error) throw traduzirErroAuth(resultado.error)
  return resultado.data
}

export async function entrarComEmail({ email, password }) {
  const cliente = exigirSupabase()
  const data = await executar(() =>
    cliente.auth.signInWithPassword({ email: email.trim(), password }),
  )
  return { user: data.user, session: data.session }
}

export async function criarConta({ name, email, password }) {
  const cliente = exigirSupabase()
  const data = await executar(() =>
    cliente.auth.signUp({
      email: email.trim(),
      password,
      options: {
        // A trigger handle_new_user cria o registro em profiles com este nome.
        data: { name: name?.trim() || null },
        emailRedirectTo: window.location.origin,
      },
    }),
  )

  // Com confirmação de e-mail ativa, o Supabase devolve um usuário sem
  // identidades quando o e-mail já está cadastrado, em vez de um erro.
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    throw erroTraduzido('error.auth.userAlreadyExists')
  }

  return {
    user: data.user,
    session: data.session,
    needsEmailConfirmation: !data.session,
  }
}

export async function entrarComGoogle({ redirectTo }) {
  const cliente = exigirSupabase()
  // Redireciona o navegador para o Google; a sessão é lida da URL na volta.
  return executar(() =>
    cliente.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    }),
  )
}

// Erros do OAuth voltam na URL (query ou hash) quando o login com o Google falha.
export function lerErroOAuthDaUrl() {
  const params = new URLSearchParams(window.location.search)
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  const erro = params.get('error') ?? hash.get('error')
  if (!erro) return null

  const descricao = params.get('error_description') ?? hash.get('error_description') ?? ''
  console.error('Supabase OAuth failed', erro, descricao)
  return erro === 'access_denied'
    ? i18n.global.t('error.auth.oauthCancelled')
    : i18n.global.t('error.auth.generic')
}

export async function sair() {
  if (!isSupabaseConfigured) return
  await executar(() => supabase.auth.signOut())
}

export async function obterSessao() {
  if (!isSupabaseConfigured) return null
  const data = await executar(() => supabase.auth.getSession())
  return data.session
}

export function observarSessao(callback) {
  if (!isSupabaseConfigured) return () => {}
  const { data } = supabase.auth.onAuthStateChange((evento, sessao) => {
    callback(evento, sessao)
  })
  return () => data.subscription.unsubscribe()
}

export async function buscarPerfil(userId) {
  const cliente = exigirSupabase()
  return executar(() =>
    cliente.from('profiles').select('id, name, created_at').eq('id', userId).maybeSingle(),
  )
}
