<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import I18nManager from '@/i18n/manager'
import FormLogin from '@/components/FormLogin.vue'
import NewAccount from '@/components/NewAccount.vue'

const { t } = useI18n()
const router = useRouter()

const email = ref('')
const password = ref('')
const name = ref('')
const confirmPassword = ref('')
const errorMsg = ref('')
const loading = ref(false)

const criarConta = ref(false)

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
        <NewAccount v-if="criarConta" v-model:name="name" v-model:confirmPassword="confirmPassword"/>
        <FormLogin v-else v-model:email="email" v-model:password="password"/>
       
        <p v-if="errorMsg" class="text-center text-sm font-semibold text-error">{{ errorMsg }}</p>

        <div v-if="criarConta" class="text-center text-sm">
        <button 
          type="button" 
          @click="criarConta = false"
          class="text-rosewood underline hover:opacity-80"
        >
          {{ t('auth.existingAccount') }}
        </button>
      </div>

        <div v-else class="text-center text-sm">
        <button 
          type="button" 
          @click="criarConta = true"
          class="text-rosewood underline hover:opacity-80"
        >
          {{ t('auth.newAccount') }}
        </button>
      </div>

        <button
          type="submit"
          :disabled="loading"
          class="mt-2 w-full rounded-full bg-rosewood px-6 py-3 font-display font-semibold text-cream-soft shadow-soft transition hover:bg-rosewood-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ loading ? t('auth.submitting') : (criarConta ? t('auth.createAccount') : t('auth.submit')) }}
        </button>
      </form>

      <div class="mt-6 text-center">
          <p class="inline-block rounded-full px-4 py-2 text-sm font-semibold text-lagoon/80 dark:text-cream-soft/80 dark:hover:bg-cream-soft/10">{{ t('auth.options') }}</p>
          
        <button
          type="submit"
          class="mt-2 w-full rounded-full bg-misty px-6 py-3 font-display font-semibold text-cream-soft shadow-soft transition hover:bg-rosewood-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
             {{ t('auth.visitor') }}
        </button>

          <button
          type="submit"
          class="mt-2 flex w-full items-center justify-center gap-3 rounded-full bg-misty px-6 py-3 font-display font-semibold text-cream-soft shadow-soft transition hover:bg-rosewood-dark"
        >
            <svg class="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
            {{ t('auth.google') }}
        </button>
      </div>

    </div>
  </div>
</template>
