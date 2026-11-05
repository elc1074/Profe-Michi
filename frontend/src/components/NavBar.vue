<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import ThemeToggle from './ThemeToggle.vue'
import LocaleSwitcher from './LocaleSwitcher.vue'

const authStore = useAuthStore()
const { t } = useI18n()

const initials = computed(() => {
  const source = authStore.displayName.trim()
  if (!source) return '?'

  const parts = source.split(/\s+/)
  return parts.length === 1
    ? parts[0].slice(0, 2).toUpperCase()
    : `${parts[0][0]}${parts.at(-1)[0]}`.toUpperCase()
})
</script>

<template>
  <header class="sticky top-0 z-20 border-b border-lagoon/10 bg-cream-soft/90 backdrop-blur dark:border-cream-soft/10 dark:bg-lagoon-soft/90">
    <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
      <RouterLink to="/" class="flex items-center gap-2.5">
        <!-- <MascotLogo :size="36" /> -->
        <img class="mascote_icone" src="../../public/mascote_icone.png" alt="Mascote Ícone" width="36" height="36">
        <span class="font-display text-lg font-semibold text-lagoon dark:text-cream-soft">{{ t('app.name') }}</span>
      </RouterLink>

      <nav class="hidden items-center gap-1 sm:flex">
        <RouterLink
          to="/"
          class="rounded-full px-4 py-2 text-sm font-semibold text-lagoon/80 transition hover:bg-lagoon/5 dark:text-cream-soft/80 dark:hover:bg-cream-soft/10"
          active-class="!bg-blush/60 !text-lagoon dark:!bg-rosewood/30 dark:!text-cream-soft"
        >
          {{ t('nav.home') }}
        </RouterLink>
        <RouterLink
          to="/"
          class="rounded-full px-4 py-2 text-sm font-semibold text-lagoon/80 transition hover:bg-lagoon/5 dark:text-cream-soft/80 dark:hover:bg-cream-soft/10"
          active-class="!bg-blush/60 !text-lagoon dark:!bg-rosewood/30 dark:!text-cream-soft"
        >
          {{ t('nav.history') }}
        </RouterLink>
        <RouterLink
          to="/"
          class="rounded-full px-4 py-2 text-sm font-semibold text-lagoon/80 transition hover:bg-lagoon/5 dark:text-cream-soft/80 dark:hover:bg-cream-soft/10"
          active-class="!bg-blush/60 !text-lagoon dark:!bg-rosewood/30 dark:!text-cream-soft"
        >
          {{ t('nav.statistics') }}
        </RouterLink>
      </nav>

      <div class="flex items-center gap-2">
        <LocaleSwitcher />
        <ThemeToggle />
        <RouterLink
          v-if="authStore.isAuthenticated"
          to="/perfil"
          :aria-label="t('nav.profile')"
          :title="t('nav.profile')"
          class="flex h-9 w-9 items-center justify-center rounded-full bg-rosewood font-display text-sm font-semibold text-cream-soft shadow-sm transition hover:bg-rosewood-dark focus-visible:outline-offset-2"
          active-class="ring-2 ring-rosewood ring-offset-2 ring-offset-cream-soft dark:ring-cream-soft dark:ring-offset-lagoon-soft"
        >
          {{ initials }}
        </RouterLink>
        <RouterLink
          v-else
          to="/login"
          class="rounded-full bg-rosewood px-4 py-2 font-display text-sm font-semibold text-cream-soft shadow-sm transition hover:bg-rosewood-dark"
          active-class="ring-2 ring-rosewood ring-offset-2 ring-offset-cream-soft dark:ring-cream-soft dark:ring-offset-lagoon-soft"
        >
          {{ t('nav.start') }}
        </RouterLink>
      </div>
    </div>
  </header>
</template>
