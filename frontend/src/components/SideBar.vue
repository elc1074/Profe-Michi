<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()
const leaving = ref(false)
const isOpen = ref(false)

const displayName = computed(() => auth.displayName || t('profile.notProvided'))
const initials = computed(() => displayName.value
  .split(/\s+/)
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0])
  .join('')
  .toUpperCase())

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
  <section class="barra" :class="{ 'is-open': isOpen }" aria-label="Navegação da conta">
    <button
      type="button"
      class="account-sidebar-toggle"
      :aria-expanded="isOpen"
      :aria-label="isOpen ? 'Fechar menu da conta' : 'Abrir menu da conta'"
      :title="isOpen ? 'Fechar menu da conta' : 'Abrir menu da conta'"
      @click="isOpen = !isOpen"
    >
      <svg v-if="isOpen" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m15 18-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
      <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
    </button>
    <aside
      v-if="isOpen"
      class="h-full w-full shrink-0 border-b border-lagoon/10 bg-blush/40 dark:border-cream-soft/10 dark:bg-lagoon-light/30 lg:w-64 lg:border-b-0 lg:border-r"
    >
      <div class="flex h-full flex-col p-3 lg:p-5">
        <RouterLink to="/perfil" class="account-summary group hidden rounded-xl2 p-3 transition hover:bg-cream-soft/70 focus-visible:outline-none dark:hover:bg-cream-soft/10 lg:flex" aria-label="Abrir perfil">
          <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rosewood font-display text-sm font-bold text-cream-soft shadow-sm">
            {{ initials }}
          </span>
          <span class="min-w-0">
            <span class="block truncate font-display font-semibold text-lagoon dark:text-cream-soft">{{ displayName }}</span>
            <span class="mt-0.5 block truncate text-xs text-lagoon/60 dark:text-cream-soft/60">{{ auth.user?.email }}</span>
          </span>
        </RouterLink>

        <p class="nav-label hidden lg:block">Minha conta</p>
        <nav class="flex gap-1 overflow-x-auto lg:flex-col lg:gap-1 lg:overflow-visible" aria-label="Seções da conta">
          <div class="links">
            <RouterLink
              to="/perfil"
              class="account-link flex min-w-0 shrink-0 items-center gap-3 rounded-xl2 px-4 py-3 text-sm font-semibold text-lagoon/80 transition hover:bg-lagoon/5 dark:text-cream-soft/80 dark:hover:bg-cream-soft/10 lg:text-base"
              active-class="is-active"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2" />
                <path d="M4 20c1.5-4 14.5-4 16 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
              <span class="min-w-0 truncate">{{ t('nav.profile') }}</span>
            </RouterLink>

          <RouterLink
            to="/historico"
            class="account-link flex min-w-0 shrink-0 items-center gap-3 rounded-xl2 px-4 py-3 text-sm font-semibold text-lagoon/80 transition hover:bg-lagoon/5 dark:text-cream-soft/80 dark:hover:bg-cream-soft/10 lg:text-base"
            active-class="is-active"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" />
              <path d="M12 7v5l3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
            <span class="min-w-0 truncate">{{ t('nav.history') }}</span>
          </RouterLink>

          <RouterLink
            to="/estatisticas"
            class="account-link flex min-w-0 shrink-0 items-center gap-3 rounded-xl2 px-4 py-3 text-sm font-semibold text-lagoon/80 transition hover:bg-lagoon/5 dark:text-cream-soft/80 dark:hover:bg-cream-soft/10 lg:text-base"
            active-class="is-active"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 20V10M12 20V4M19 20v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
            <span class="min-w-0 truncate">{{ t('nav.statistics') }}</span>
          </RouterLink>
          </div>
        </nav>

        <div class="logout-area">
          <button type="button" :disabled="leaving" class="flex shrink-0 items-center gap-3 rounded-xl2 px-4 py-3 text-sm font-semibold text-lagoon/80 transition hover:bg-error-bg/70 disabled:cursor-not-allowed disabled:opacity-60 dark:text-cream-soft/80 dark:hover:bg-error-bgDark lg:w-full" @click="logout">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M10 4H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M15 8l4 4-4 4M19 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span class="whitespace-nowrap">{{ leaving ? t('profile.leaving') : t('profile.logout') }}</span>
          </button>
        </div>
      </div>
    </aside>
  </section>
</template>

<style scoped>
.barra {
  flex: 0 0 0;
  min-width: 0;
  min-height: 0;
}

.barra.is-open {
  min-height: calc(100vh - 61px);
}

.account-sidebar-toggle {
  position: fixed;
  top: calc(61px + 0.75rem);
  left: 0.9rem;
  z-index: 25;
  display: flex;
  width: 2.25rem;
  height: 2.25rem;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: #faf9f6;
  box-shadow: 0 4px 14px -5px rgb(29 39 49 / 0.35);
  color: #1D2731;
  transition: background 150ms ease, color 150ms ease;
}

.account-sidebar-toggle:hover {
  background: #F5E2DE;
}

:global(.dark) .account-sidebar-toggle {
  background: #2f4867;
  color: #faf9f6;
}

:global(.dark) .account-sidebar-toggle:hover {
  background: #7F6E81;
}

.links {
  display: flex;
  flex-direction: column;
  min-width: 0;
  width: 100%;
}

.account-summary {
  align-items: center;
  gap: 0.75rem;
}

.nav-label {
  margin: 1.75rem 0 0.5rem;
  padding: 0 1rem;
  color: rgb(17 75 74 / 0.58);
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.account-link.is-active {
  background: rgb(155 179 217 / 0.3);
  color: #1D2731;
}

.logout-area {
  margin-top: auto;
  padding-top: 1rem;
}

:global(.dark) .account-link.is-active {
  background: rgb(127 110 129 / 0.3);
  color: #faf9f6;
}

:global(.dark) .nav-label {
  color: rgb(250 243 225 / 0.58);
}

@media (min-width: 1024px) {
  .barra aside {
    position: fixed;
    top: 61px;
    bottom: 0;
    left: 0;
    z-index: 10;
    width: 16rem;
    height: auto;
  }

  .barra.is-open .account-sidebar-toggle {
    left: 13.6rem;
  }
}

@media (max-width: 1023px) {
  .barra {
    flex-basis: auto;
    min-height: 0;
  }

  .barra.is-open {
    min-height: auto;
  }

  .logout-area {
    margin-top: 0;
    padding-top: 0;
  }
}
</style>
