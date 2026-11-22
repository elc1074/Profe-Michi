<script setup>
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import BaseButton from '../components/BaseButton.vue'
import MascotFull from '../components/MascotFull.vue'
import AccountDeletionDialogHost from '../components/AccountDeletionDialogHost.vue'
import { preloadLiveTranscription } from '../services/krokoLiveTranscription'
import { ref } from 'vue'

const { t, locale } = useI18n()
const router = useRouter()

function startNewQuiz() {
  // Normally this shares the recognizer initialization started by App.vue.
  // It also retries a failed preload before the student reaches the quiz.
  void preloadLiveTranscription(locale.value).catch(() => {})
  router.push('/enviar')
}

const steps = [
  { title: 'step1Title', body: 'step1Body', icon: 'upload' },
  { title: 'step2Title', body: 'step2Body', icon: 'mic' },
  { title: 'step3Title', body: 'step3Body', icon: 'heart' },
]

const participantes = [
  {
    name: 'Amanda Carolina Messer Siebeneichler',
    course: 'Sistemas de Informação',
    university: 'Universidade Federal de Santa Maria (UFSM)',
    photo: '/public/mascote_maior.webp',
  },
  {
    name: 'Ana Catalina Rojas Navarro',
    course: 'Anatomía de Animales de Compañía',
    university: 'Universidad Santo Tomás (UST)',
    photo: '/public/mascote_maior.webp',
  },
  {
    name: 'Catalina Belén Martinez González',
    course: 'Anatomía de Animales de Compañía',
    university: 'Universidad Santo Tomás (UST)',
    photo: '/public/mascote_maior.webp',
  },
  {
    name: 'Daiane Dias Vieira',
    course: 'Ciência da Computação',
    university: 'Universidade Federal de Santa Maria (UFSM)',
    photo: '/public/mascote_maior.webp',
  },
  {
    name: 'Giovana Borelli',
    course: 'Ciência da Computação',
    university: 'Universidade Federal de Santa Maria (UFSM)',
    photo: '/public/mascote_maior.webp',
  },
  {
    name: 'Nathália de Almeida Zófoli',
    course: 'Sistemas de Informação',
    university: 'Universidade Federal de Santa Maria (UFSM)',
    photo: '/public/mascote_maior.webp',
  },
]

const videos = [
  { id: 'c1Etevp-6fM', titleKey: 'home.videoPresentation' },
  { id: 'Da6WG5sfLc4', titleKey: 'home.videoAccount' },
  { id: 'jmsQ-pnaHEM', titleKey: 'home.videoProfile' },
  { id: 'WXvaM3sFeto', titleKey: 'home.videoQuiz' },
]

const singleVideo = { id: '7nh7tPM3ugw', titleKey: 'home.toolUseTitle' }
const singlePlaying = ref(false)

const carousel = ref(null)
const activeVideo = ref(0)

function goToVideo(index) {
  const el = carousel.value
  if (!el) return
  const target = Math.max(0, Math.min(index, videos.length - 1))
  el.scrollTo({ left: target * el.clientWidth, behavior: 'smooth' })
}

const playingVideo = ref(null)

function onCarouselScroll() {
  const el = carousel.value
  if (!el) return
  const index = Math.round(el.scrollLeft / el.clientWidth)
  if (index !== activeVideo.value) {
    activeVideo.value = index
    playingVideo.value = null // remove o iframe e para o vídeo anterior
  }
}
</script>

<template>
  <AccountDeletionDialogHost />
  <div class="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-10">
    <section class="grid items-center gap-10 sm:grid-cols-2">
      <div>
        <h1 class="max-w-md text-3xl font-semibold leading-tight text-lagoon dark:text-cream-soft sm:text-4xl">
          {{ t('home.title') }}
        </h1>
        <p class="mt-4 max-w-md text-base text-lagoon/70 dark:text-cream-soft/70">
          {{ t('home.subtitle') }}
        </p>
        <BaseButton size="lg" class="mt-8" @click="startNewQuiz">
          {{ t('home.cta') }}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </BaseButton>
      </div>
      <div class="flex justify-center rounded-blob bg-blush-soft py-10 dark:bg-lagoon-light/40">
        <!--<MascotFull :size="220" />-->
        <picture>
          <img class="mascote_maior max-h-[240px]" src="../../public/mascote_maior.webp" alt="Descrição da imagem">
        </picture>

      </div>
    </section>

    <section class="mt-16">
      <h2 class="font-display text-xl font-semibold text-lagoon dark:text-cream-soft">{{ t('home.stepsTitle') }}</h2>
      <div class="mt-5 grid gap-4 sm:grid-cols-3">
        <div
          v-for="step in steps"
          :key="step.title"
          class="rounded-xl2 bg-cream p-5 shadow-soft dark:bg-lagoon-light/50 dark:shadow-softDark"
        >
          <div class="mb-3 grid h-11 w-11 place-items-center rounded-full bg-sage/20 text-sage-dark dark:bg-sage/25 dark:text-sage-light">
            <svg v-if="step.icon === 'upload'" width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 16V4M7 9l5-5 5 5M5 20h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
            <svg v-else-if="step.icon === 'mic'" width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" stroke-width="2" /><path d="M6 11a6 6 0 0 0 12 0M12 19v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 20.5s-7.5-4.6-9.7-9.2C.7 7.8 2.4 4.6 5.6 4c2-.4 3.8.5 5 2.1a5.4 5.4 0 0 1 5-2.1c3.2.6 4.9 3.8 3.3 7.3-2.2 4.6-9.7 9.2-9.7 9.2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" /></svg>
          </div>
          <h3 class="font-display font-semibold text-lagoon dark:text-cream-soft">{{ t(`home.${step.title}`) }}</h3>
          <p class="mt-1 text-sm text-lagoon/65 dark:text-cream-soft/65">{{ t(`home.${step.body}`) }}</p>
        </div>
      </div>
    </section>

    <section class="mt-16">
      <h2 class="font-display text-xl font-semibold text-lagoon dark:text-cream-soft">
        {{ t('home.visitorTitle') }}
      </h2>
      
      <div class="mt-5 flex items-center justify-between gap-8">
        <p class="text-base text-lagoon/70 dark:text-cream-soft/70">
          {{ t('home.visitorBody') }}
        </p>
        
        <BaseButton size="lg" class="shrink-0" @click="startNewQuiz">
          {{ t('home.start') }}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </BaseButton>
      </div>
    </section>

    <section class="mt-16">
      <h2 class="font-display text-xl font-semibold text-lagoon dark:text-cream-soft">{{ t('home.aboutTitle') }}</h2>
      <p class="mt-4 text-base text-lagoon/70 dark:text-cream-soft/70">{{ t('home.aboutBody') }}</p>
    </section>

    <section class="mt-16">
      <h2 class="font-display text-xl font-semibold text-lagoon dark:text-cream-soft">{{ t('home.useTitle') }}</h2>
      <p class="mt-4 text-base text-lagoon/70 dark:text-cream-soft/70">{{ t('home.useBody') }}</p>

      <div class="mx-auto mt-6 max-w-3xl" role="region" aria-roledescription="carousel" :aria-label="t('home.useTitle')">
        <div
          ref="carousel"
          class="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          @scroll.passive="onCarouselScroll"
        >
          <figure
            v-for="(video, index) in videos"
            :key="index"
            class="w-full shrink-0 snap-center px-1"
            role="group"
            aria-roledescription="slide"
            :aria-label="`${index + 1} / ${videos.length}`"
          >
            <div class="relative aspect-video w-full overflow-hidden rounded-xl2 shadow-soft dark:shadow-softDark">
          <iframe
            v-if="playingVideo === index"
            class="h-full w-full"
            :src="`https://www.youtube.com/embed/${video.id}?autoplay=1`"
            :title="t(video.titleKey)"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen
          ></iframe>

          <button
            v-else
            type="button"
            class="group relative block h-full w-full"
            :aria-label="`${t('home.playVideo')}: ${t(video.titleKey)}`"
            @click="playingVideo = index"
          >
            <img
              :src="`https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`"
              alt=""
              loading="lazy"
              class="h-full w-full object-cover"
              @error="$event.target.src = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`"
            />
            <span class="absolute inset-0 grid place-items-center bg-lagoon/20 transition group-hover:bg-lagoon/30">
              <span class="grid h-16 w-16 place-items-center rounded-full bg-rosewood text-cream-soft shadow-soft">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor" />
                </svg>
              </span>
            </span>
          </button>
        </div>
            <figcaption class="mt-3 text-center font-display font-semibold text-lagoon dark:text-cream-soft">
              {{ t(video.titleKey) }}
            </figcaption>
          </figure>
        </div>

        <!-- Controles: anterior, indicadores, próximo -->
        <div class="mt-4 flex items-center justify-center gap-4">
          <button
            type="button"
            class="grid h-10 w-10 place-items-center rounded-full bg-misty/30 text-lagoon transition hover:bg-misty/50 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-cream-soft/10 dark:text-cream-soft dark:hover:bg-cream-soft/20"
            :aria-label="t('home.carouselPrev')"
            :disabled="activeVideo === 0"
            @click="goToVideo(activeVideo - 1)"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" /></svg>
          </button>

          <div class="flex items-center gap-2">
            <button
              v-for="(video, index) in videos"
              :key="index"
              type="button"
              class="h-3 w-3 rounded-full transition"
              :class="index === activeVideo ? 'bg-rosewood' : 'bg-lagoon/20 hover:bg-lagoon/40 dark:bg-cream-soft/25 dark:hover:bg-cream-soft/45'"
              :aria-label="t('home.carouselGoTo', { n: index + 1 })"
              :aria-current="index === activeVideo ? 'true' : undefined"
              @click="goToVideo(index)"
            ></button>
          </div>

          <button
            type="button"
            class="grid h-10 w-10 place-items-center rounded-full bg-misty/30 text-lagoon transition hover:bg-misty/50 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-cream-soft/10 dark:text-cream-soft dark:hover:bg-cream-soft/20"
            :aria-label="t('home.carouselNext')"
            :disabled="activeVideo === videos.length - 1"
            @click="goToVideo(activeVideo + 1)"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" /></svg>
          </button>
        </div>
      </div>
    </section>

    <section class="mt-16">
      <h2 class="font-display text-xl font-semibold text-lagoon dark:text-cream-soft">{{ t('home.toolUseTitle') }}</h2>
      <p class="mt-4 text-base text-lagoon/70 dark:text-cream-soft/70">{{ t('home.tooleUseBody') }}</p>

      <figure class="mx-auto mt-6 max-w-3xl">
        <div class="relative aspect-video w-full overflow-hidden rounded-xl2 shadow-soft dark:shadow-softDark">
          <iframe
            v-if="singlePlaying"
            class="h-full w-full"
            :src="`https://www.youtube.com/embed/${singleVideo.id}?autoplay=1`"
            :title="t(singleVideo.titleKey)"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen
          ></iframe>

          <button
            v-else
            type="button"
            class="group relative block h-full w-full"
            :aria-label="`${t('home.playVideo')}: ${t(singleVideo.titleKey)}`"
            @click="singlePlaying = true"
          >
            <img
              :src="`https://i.ytimg.com/vi/${singleVideo.id}/maxresdefault.jpg`"
              alt=""
              loading="lazy"
              class="h-full w-full object-cover"
              @error="$event.target.src = `https://i.ytimg.com/vi/${singleVideo.id}/hqdefault.jpg`"
            />
            <span class="absolute inset-0 grid place-items-center bg-lagoon/20 transition group-hover:bg-lagoon/30">
              <span class="grid h-16 w-16 place-items-center rounded-full bg-rosewood text-cream-soft shadow-soft">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor" />
                </svg>
              </span>
            </span>
          </button>
        </div>
      </figure>
    </section>
    
    <section class="mt-16">
      <h2 class="font-display text-xl font-semibold text-lagoon dark:text-cream-soft">
        {{ t('home.teamTitle') }}
      </h2>

      <div class="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="member in participantes"
          :key="member.name"
          class="flex flex-col items-center rounded-xl2 bg-cream p-5 text-center shadow-soft dark:bg-lagoon-light/50 dark:shadow-softDark"
        >
          <img
            :src="member.photo"
            :alt="member.name"
            class="mb-4 h-20 w-20 rounded-xl object-cover"
          />

          <h3 class="font-display font-semibold text-lagoon dark:text-cream-soft align-center">
            {{ member.name }}
          </h3>
          <p class="mt-1 text-sm text-lagoon/70 dark:text-cream-soft/70 align-center">
            {{ member.course }}
          </p>
          <p class="mt-0.5 text-xs font-medium text-sage-dark dark:text-sage-light align-center">
            {{ member.university }}
          </p>
        </div>
      </div>
    </section>

    <section class="mt-16">
      <h2 class="font-display text-xl font-semibold text-lagoon dark:text-cream-soft">{{ t('home.developmentTitle') }}</h2>
      <p class="mt-4 text-base text-lagoon/70 dark:text-cream-soft/70">{{ t('home.developmentBody') }}</p>
    </section>
  </div>
</template>

<style scoped>
video {
  height: 400px;
  width: auto;
  display: block;
  align-items: center;
  justify-content: center;
}
</style>
