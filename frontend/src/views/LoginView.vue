<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import I18nManager from '@/i18n/manager'

const { t } = useI18n()
const router = useRouter()

const email = ref('')
const password = ref('')
const errorMsg = ref('')
const loading = ref(false)

async function handleSubmit() {
  errorMsg.value = ''

  if (!email.value || !password.value) {
    errorMsg.value = t('auth.missingFields')
    return
  }

  loading.value = true
  try {
    // TODO: substituir pela chamada real de autenticação assim que o endpoint existir
    await new Promise((resolve) => setTimeout(resolve, 600))
    router.push(I18nManager.i18nRoute({ name: 'upload' }))
  } catch (err) {
    errorMsg.value = t('auth.genericError')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-start justify-center bg-cream px-4 pt-24 pb-12 dark:bg-lagoon-soft">
    <div class="w-full max-w-sm rounded-xl2 border border-lagoon/10 bg-cream-soft p-8 shadow-soft dark:border-cream-soft/10 dark:bg-lagoon-light/40">
      <div class="mb-8 flex flex-col items-center gap-3 text-center">
        <img class="mascote_icone" src="../../public/mascote_icone.png" alt="Mascote Ícone" width="36" height="36">
        <h1 class="font-display text-2xl font-semibold text-lagoon dark:text-cream-soft">{{ t('app.name') }}</h1>
      </div>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label for="login-email" class="sr-only">{{ t('auth.emailLabel') }}</label>
          <input
            id="login-email"
            v-model="email"
            type="email"
            autocomplete="email"
            :placeholder="t('auth.emailLabel')"
            class="w-full rounded-full border border-lagoon/15 bg-cream px-5 py-3 text-sm text-lagoon placeholder:text-lagoon/45 outline-none transition focus:outline-none focus:ring-1 focus:ring-rosewood focus:ring-offset-0 dark:border-cream-soft/15 dark:bg-lagoon-soft dark:text-cream-soft dark:placeholder:text-cream-soft/40"
          />
        </div>

        <div>
          <label for="login-password" class="sr-only">{{ t('auth.passwordLabel') }}</label>
          <input
            id="login-password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            :placeholder="t('auth.passwordLabel')"
            class="w-full rounded-full border border-lagoon/15 bg-cream px-5 py-3 text-sm text-lagoon placeholder:text-lagoon/45 outline-none transition focus:outline-none focus:ring-1 focus:ring-rosewood focus:ring-offset-0 dark:border-cream-soft/15 dark:bg-lagoon-soft dark:text-cream-soft dark:placeholder:text-cream-soft/40"
          />
        </div>

        <p v-if="errorMsg" class="text-center text-sm font-semibold text-error">{{ errorMsg }}</p>

        <button
          type="submit"
          :disabled="loading"
          class="mt-2 w-full rounded-full bg-rosewood px-6 py-3 font-display font-semibold text-cream-soft shadow-soft transition hover:bg-rosewood-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ loading ? t('auth.submitting') : t('auth.submit') }}
        </button>
      </form>
        <div class="mt-6 text-center">
          <RouterLink
            to="/enviar"
            class="inline-block rounded-full px-4 py-2 text-sm font-semibold text-lagoon/80 dark:text-cream-soft/80 dark:hover:bg-cream-soft/10"
          >
          {{ t('auth.visitor') }}
        </RouterLink>
        </div>
    </div>
  </div>
</template>
