<script setup>
import { useI18n } from 'vue-i18n'

defineProps({
  status: { type: String, required: true },
})

const emit = defineEmits(['close'])
const { t } = useI18n()
</script>

<template>
  <div class="fixed inset-0 z-50 grid place-items-center bg-lagoon/45 px-4 py-6 backdrop-blur-sm dark:bg-black/60">
    <section
      class="relative flex aspect-square w-full max-w-lg flex-col rounded-xl2 bg-cream-soft p-6 shadow-soft dark:bg-lagoon-soft dark:shadow-softDark sm:p-10"
      role="dialog"
      aria-modal="true"
      :aria-label="status === 'deleting' ? t('profile.deletionInProgress') : t('profile.deletionCompleted')"
      aria-live="polite"
    >
      <button
        v-if="status === 'completed'"
        type="button"
        class="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-2xl leading-none text-lagoon/60 transition hover:bg-lagoon/10 hover:text-lagoon dark:text-cream-soft/60 dark:hover:bg-cream-soft/10 dark:hover:text-cream-soft"
        :aria-label="t('profile.close')"
        @click="emit('close')"
      >
        <span aria-hidden="true">&times;</span>
      </button>

      <template v-if="status === 'deleting'">
        <div class="flex flex-1 flex-col items-center justify-center gap-5 text-center">
          <svg class="h-10 w-10 animate-spin text-rosewood dark:text-cream-soft" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle class="opacity-25" cx="12" cy="12" r="9" stroke="currentColor" stroke-width="3" />
            <path class="opacity-90" d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
          </svg>
          <p class="font-display text-lg font-semibold text-lagoon dark:text-cream-soft">{{ t('profile.deletionInProgress') }}</p>
        </div>
      </template>

      <template v-else>
        <div class="flex flex-1 flex-col items-center pt-6 text-center sm:pt-8">
          <p class="w-full font-display text-xl font-semibold leading-relaxed text-lagoon dark:text-cream-soft sm:text-2xl">
            {{ t('profile.deletionCompleted') }}
          </p>
          <p class="mt-3 w-full font-body text-base leading-relaxed text-lagoon/75 dark:text-cream-soft/75">
            {{ t('profile.deletionFollowup') }}
          </p>
          <img
            src="../../public/mascote_maior.webp"
            :alt="t('profile.mascotAlt')"
            class="mt-auto h-[100%] max-h-56 w-[100%] mr-4 object-contain"
          >
        </div>
      </template>
    </section>
  </div>
</template>
