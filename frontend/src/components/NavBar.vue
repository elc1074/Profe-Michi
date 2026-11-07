<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRouter } from 'vue-router'
import ThemeToggle from './ThemeToggle.vue'
import LocaleSwitcher from './LocaleSwitcher.vue'

const authStore = useAuthStore()
const { t } = useI18n()
const router = useRouter()
const profileMenu = ref(null)
const isProfileMenuOpen = ref(false)
const leaving = ref(false)

const initials = computed(() => {
  const candidates = [
    authStore.profile?.name,
    authStore.user?.user_metadata?.full_name,
    authStore.user?.user_metadata?.name,
    authStore.displayName,
  ].filter((value) => typeof value === 'string' && value.trim())
  const source = candidates.find((value) => value.trim().split(/\s+/).length > 1) || candidates[0] || ''
  if (!source) return '?'

  const parts = source.trim().split(/\s+/)
  return parts.length === 1
    ? parts[0].slice(0, 2).toUpperCase()
    : `${parts[0][0]}${parts.at(-1)[0]}`.toUpperCase()
})

function closeProfileMenu() {
  isProfileMenuOpen.value = false
}

function toggleProfileMenu() {
  isProfileMenuOpen.value = !isProfileMenuOpen.value
}

function handleOutsideClick(event) {
  if (profileMenu.value && !profileMenu.value.contains(event.target)) closeProfileMenu()
}

async function logout() {
  leaving.value = true
  try {
    await authStore.logout()
    await router.replace({ name: 'login' })
  } finally {
    leaving.value = false
    closeProfileMenu()
  }
}

onMounted(() => document.addEventListener('mousedown', handleOutsideClick))
onBeforeUnmount(() => document.removeEventListener('mousedown', handleOutsideClick))
</script>

<template>
  <header class="sticky top-0 z-20 h-[61px] border-b border-lagoon/10 bg-cream-soft/90 backdrop-blur dark:border-cream-soft/10 dark:bg-lagoon-soft/90">
    <div class="mx-auto flex h-full max-w-5xl items-center justify-between px-4 sm:px-6">
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
          to="/historico"
          class="rounded-full px-4 py-2 text-sm font-semibold text-lagoon/80 transition hover:bg-lagoon/5 dark:text-cream-soft/80 dark:hover:bg-cream-soft/10"
          active-class="!bg-blush/60 !text-lagoon dark:!bg-rosewood/30 dark:!text-cream-soft"
        >
          {{ t('nav.history') }}
        </RouterLink>
        <RouterLink
          to="/estatisticas"
          class="rounded-full px-4 py-2 text-sm font-semibold text-lagoon/80 transition hover:bg-lagoon/5 dark:text-cream-soft/80 dark:hover:bg-cream-soft/10"
          active-class="!bg-blush/60 !text-lagoon dark:!bg-rosewood/30 dark:!text-cream-soft"
        >
          {{ t('nav.statistics') }}
        </RouterLink>
  
      </nav>
      <div class="flex items-center gap-2">
        <LocaleSwitcher />
        <ThemeToggle />
        <div v-if="authStore.isAuthenticated" ref="profileMenu" class="relative">
          <button
            type="button"
            :aria-expanded="isProfileMenuOpen"
            aria-haspopup="menu"
            :aria-label="t('nav.profile')"
            :title="t('nav.profile')"
            class="flex h-9 w-9 items-center justify-center rounded-full bg-rosewood font-display text-sm font-semibold text-cream-soft shadow-sm transition hover:bg-rosewood-dark focus-visible:outline-offset-2"
            :class="{ 'ring-2 ring-rosewood ring-offset-2 ring-offset-cream-soft dark:ring-cream-soft dark:ring-offset-lagoon-soft': isProfileMenuOpen }"
            @click="toggleProfileMenu"
            @keydown.escape="closeProfileMenu"
          >
            {{ initials }}
          </button>

          <div
            v-if="isProfileMenuOpen"
            class="absolute right-0 top-full z-30 mt-3 w-56 overflow-hidden rounded-xl2 border border-lagoon/10 bg-cream-soft p-2 shadow-soft dark:border-cream-soft/10 dark:bg-lagoon-light dark:shadow-softDark"
            role="menu"
            :aria-label="t('nav.profile')"
          >
            <div class="border-b border-lagoon/10 px-3 py-2.5 dark:border-cream-soft/10">
              <p class="truncate font-display text-sm font-semibold text-lagoon dark:text-cream-soft">{{ authStore.displayName }}</p>
              <p class="mt-0.5 truncate text-xs text-lagoon/60 dark:text-cream-soft/60">{{ authStore.user?.email }}</p>
            </div>
            <RouterLink
              to="/enviar"
              role="menuitem"
              class="mt-1 flex items-center gap-2.5 rounded-xl2 px-3 py-2.5 text-sm font-semibold text-lagoon/80 transition hover:bg-blush/60 dark:text-cream-soft/80 dark:hover:bg-rosewood/30"
              @click="closeProfileMenu"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
              {{ t('nav.newQuiz') }}
            </RouterLink>
            <RouterLink
              to="/historico"
              role="menuitem"
              class="flex items-center gap-2.5 rounded-xl2 px-3 py-2.5 text-sm font-semibold text-lagoon/80 transition hover:bg-blush/60 dark:text-cream-soft/80 dark:hover:bg-rosewood/30"
              @click="closeProfileMenu"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" /><path d="M12 7v5l3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
              {{ t('nav.history') }}
            </RouterLink>
            <RouterLink
              to="/estatisticas"
              role="menuitem"
              class="flex items-center gap-2.5 rounded-xl2 px-3 py-2.5 text-sm font-semibold text-lagoon/80 transition hover:bg-blush/60 dark:text-cream-soft/80 dark:hover:bg-rosewood/30"
              @click="closeProfileMenu"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 20V10M12 20V4M19 20v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
              {{ t('nav.statistics') }}
            </RouterLink>
            <div class="my-1 border-t border-lagoon/10 dark:border-cream-soft/10"></div>
            <RouterLink
              to="/perfil"
              role="menuitem"
              class="flex items-center gap-2.5 rounded-xl2 px-3 py-2.5 text-sm font-semibold text-lagoon/80 transition hover:bg-blush/60 dark:text-cream-soft/80 dark:hover:bg-rosewood/30"
              @click="closeProfileMenu"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2" /><path d="M4 20c1.5-4 14.5-4 16 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
              {{ t('nav.profile') }}
            </RouterLink>
            <button type="button" role="menuitem" :disabled="leaving" class="flex w-full items-center gap-2.5 rounded-xl2 px-3 py-2.5 text-left text-sm font-semibold text-error transition hover:bg-error-bg disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-error-bgDark" @click="logout">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M10 4H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M15 8l4 4-4 4M19 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
              {{ leaving ? t('profile.leaving') : t('profile.logout') }}
            </button>
          </div>
        </div>
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
