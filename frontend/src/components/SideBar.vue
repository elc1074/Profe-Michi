<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()
const emit = defineEmits(['delete-account'])
const leaving = ref(false)

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
  <section class="barra">
    <aside
      class="h-full w-full shrink-0 border-b border-lagoon/10 bg-blush/40 dark:border-cream-soft/10 dark:bg-lagoon-light/30 lg:w-72 lg:border-b-0 lg:border-r"
    >
      <nav
        class="flex gap-1 overflow-x-auto p-3 lg:flex-col lg:gap-2 lg:overflow-visible lg:p-6"
      >
        <div class="links">
          <RouterLink
            to="/estatisticas"
            class="flex min-w-0 shrink-0 items-center gap-3 rounded-xl2 px-4 py-3 text-sm font-semibold text-lagoon/80 transition hover:bg-lagoon/5 disabled:cursor-not-allowed disabled:opacity-40 dark:text-cream-soft/80 dark:hover:bg-cream-soft/10 lg:text-base"
            active-class="!bg-sage/30 !text-lagoon dark:!bg-rosewood/30 dark:!text-cream-soft"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 20V10M12 20V4M19 20v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
            <span class="min-w-0 truncate">{{ t('statistics.title') }}</span>
          </RouterLink>

          <RouterLink
            to="/historico"
            class="flex min-w-0 shrink-0 items-center gap-3 rounded-xl2 px-4 py-3 text-sm font-semibold text-lagoon/80 transition hover:bg-lagoon/5 disabled:cursor-not-allowed disabled:opacity-60 dark:text-cream-soft/80 dark:hover:bg-cream-soft/10 lg:text-base"
            active-class="!bg-sage/30 !text-lagoon dark:!bg-rosewood/30 dark:!text-cream-soft"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" />
              <path d="M12 7v5l3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
            <span class="min-w-0 truncate">{{ t('history.title') }}</span>
          </RouterLink>

          <RouterLink
            to="/perfil"
            class="flex min-w-0 shrink-0 items-center gap-3 rounded-xl2 px-4 py-3 text-sm font-semibold text-lagoon/80 transition hover:bg-lagoon/5 disabled:cursor-not-allowed disabled:opacity-60 dark:text-cream-soft/80 dark:hover:bg-cream-soft/10 lg:text-base"
            active-class="!bg-sage/30 !text-lagoon dark:!bg-rosewood/30 dark:!text-cream-soft"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2" />
              <path d="M4 20c1.5-4 14.5-4 16 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
            <span class="min-w-0 truncate">{{ t('profile.title') }}</span>
          </RouterLink>

          <button type="button" :disabled="leaving" class="flex shrink-0 items-center gap-3 rounded-xl2 px-4 py-3 text-sm font-semibold text-lagoon/80 transition hover:bg-lagoon/5 disabled:cursor-not-allowed disabled:opacity-60 dark:text-cream-soft/80 dark:hover:bg-cream-soft/10 lg:text-base" @click="logout">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M10 4H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M15 8l4 4-4 4M19 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span class="whitespace-nowrap">{{ leaving ? t('profile.leaving') : t('profile.logout') }}</span>
          </button>
        </div>
      </nav>
    </aside>
  </section>
</template>

<style scoped>
.barra {
  flex: 0 0 18rem;
  min-width: 0;
  min-height: calc(100vh - 61px);
}

.links {
  display: flex;
  flex-direction: column;
  min-width: 0;
  width: 100%;
}

@media (min-width: 1024px) {
  .barra aside {
    position: fixed;
    top: 61px;
    bottom: 0;
    left: max(0px, calc((100vw - 68rem) / 2));
    z-index: 10;
    width: 18rem;
    height: auto;
  }
}

@media (max-width: 1023px) {
  .barra {
    flex-basis: auto;
    min-height: 0;
  }
}
</style>
