<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import I18nManager from '@/i18n/manager'
import FormLogin from './FormLogin.vue'

const { t } = useI18n()
const router = useRouter()

</script>

<template>
    <div>
        <label for="login-nome" class="sr-only">{{ t('auth.name') }}</label>
        <input
        id="login-nome"
        v-model="name"
        type="text"
        autocomplete="text"
        :placeholder="t('auth.nameLabel')"
        class="w-full rounded-full border border-lagoon/15 bg-cream px-5 py-3 text-sm text-lagoon placeholder:text-lagoon/45 outline-none transition focus:outline-none focus:ring-1 focus:ring-rosewood focus:ring-offset-0 dark:border-cream-soft/15 dark:bg-lagoon-soft dark:text-cream-soft dark:placeholder:text-cream-soft/40"
        />
    </div>

    <FormLogin/>

    <div>
        <label for="login-password" class="sr-only">{{ t('auth.confirmPasswordLabel') }}</label>
        <input
        id="login-password"
        v-model="password"
        type="password"
        autocomplete="current-password"
        :placeholder="t('auth.confirmPasswordLabel')"
        class="w-full rounded-full border border-lagoon/15 bg-cream px-5 py-3 text-sm text-lagoon placeholder:text-lagoon/45 outline-none transition focus:outline-none focus:ring-1 focus:ring-rosewood focus:ring-offset-0 dark:border-cream-soft/15 dark:bg-lagoon-soft dark:text-cream-soft dark:placeholder:text-cream-soft/40"
        />
    </div>
</template>