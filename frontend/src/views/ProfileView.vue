<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()
const leaving = ref(false)

const name = computed(() => auth.displayName || t('profile.notProvided'))
const email = computed(() => auth.user?.email || t('profile.notProvided'))

onMounted(() => auth.init())

async function logout() {
  leaving.value = true
  try {
    await auth.logout()
    router.replace({ name: 'login' })
  } finally {
    leaving.value = false
  }
}
</script>

<template>
  <section class="bg-cream px-4 py-12 sm:py-16 dark:bg-lagoon-soft">
    <div class="mx-auto w-full max-w-xl">
      <div class="mb-7 text-center">
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blush text-rosewood dark:bg-rosewood/30 dark:text-cream-soft">
          <svg class="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6.75A3.75 3.75 0 1 1 8.25 6.75a3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0" /></svg>
        </div>
        <h1 class="font-display text-3xl font-semibold text-lagoon dark:text-cream-soft">{{ t('profile.title') }}</h1>
        <p class="mt-2 text-lagoon/70 dark:text-cream-soft/70">{{ t('profile.subtitle') }}</p>
      </div>

      <div class="overflow-hidden rounded-xl2 border border-lagoon/10 bg-cream-soft shadow-soft dark:border-cream-soft/10 dark:bg-lagoon-light/40">
        <dl class="divide-y divide-lagoon/10 dark:divide-cream-soft/10">
          <div class="flex items-center gap-4 px-5 py-5 sm:px-7">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blush text-rosewood dark:bg-rosewood/30 dark:text-cream-soft"><svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6.75A3.75 3.75 0 1 1 8.25 6.75a3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0" /></svg></div>
            <div class="min-w-0"><dt class="text-sm font-semibold text-lagoon/65 dark:text-cream-soft/65">{{ t('profile.name') }}</dt><dd class="truncate text-base font-bold text-lagoon dark:text-cream-soft">{{ name }}</dd></div>
          </div>
          <div class="flex items-center gap-4 px-5 py-5 sm:px-7">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage/25 text-lagoon dark:bg-sage/20 dark:text-cream-soft"><svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m3 7 9 6 9-6M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z" /></svg></div>
            <div class="min-w-0"><dt class="text-sm font-semibold text-lagoon/65 dark:text-cream-soft/65">{{ t('profile.email') }}</dt><dd class="truncate text-base font-bold text-lagoon dark:text-cream-soft">{{ email }}</dd></div>
          </div>
          <div class="flex items-center gap-4 px-5 py-5 sm:px-7">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-misty/30 text-lagoon dark:bg-misty/20 dark:text-cream-soft"><svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect width="14" height="11" x="5" y="11" rx="2" /><path stroke-linecap="round" d="M8 11V7a4 4 0 0 1 8 0v4" /></svg></div>
            <div><dt class="text-sm font-semibold text-lagoon/65 dark:text-cream-soft/65">{{ t('profile.password') }}</dt><dd class="text-base font-bold tracking-[0.22em] text-lagoon dark:text-cream-soft">••••••••</dd></div>
          </div>
        </dl>
        <div class="border-t border-lagoon/10 p-5 dark:border-cream-soft/10 sm:px-7">
          <button type="button" :disabled="leaving" class="w-full rounded-full border border-error/40 px-6 py-3 font-display font-semibold text-error transition hover:bg-error-bg disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-error-bgDark" @click="logout">{{ leaving ? t('profile.leaving') : t('profile.logout') }}</button>
        </div>
      </div>
    </div>
  </section>
</template>
