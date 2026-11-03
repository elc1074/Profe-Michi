<script setup>
import { useI18n } from 'vue-i18n'
import FormLogin from './FormLogin.vue'

const name = defineModel('name', { type: String, default: '' })
const email = defineModel('email', { type: String, default: '' })
const password = defineModel('password', { type: String, default: '' })
const confirmPassword = defineModel('confirmPassword', { type: String, default: '' })

const { t } = useI18n()
</script>

<template>
    <div>
        <label for="login-nome" class="sr-only">{{ t('auth.nameLabel') }}</label>
        <input
        id="login-nome"
        v-model="name"
        type="text"
        autocomplete="name"
        :placeholder="t('auth.nameLabel')"
        class="w-full rounded-full border border-lagoon/15 bg-cream px-5 py-3 text-sm text-lagoon placeholder:text-lagoon/45 outline-none transition focus:outline-none focus:ring-1 focus:ring-rosewood focus:ring-offset-0 dark:border-cream-soft/15 dark:bg-lagoon-soft dark:text-cream-soft dark:placeholder:text-cream-soft/40"
        />
    </div>

    <FormLogin v-model:email="email" v-model:password="password" new-password />

    <div>
        <label for="login-confirm-password" class="sr-only">{{ t('auth.confirmPasswordLabel') }}</label>
        <input
        id="login-confirm-password"
        v-model="confirmPassword"
        type="password"
        required
        autocomplete="new-password"
        :placeholder="t('auth.confirmPasswordLabel')"
        class="w-full rounded-full border border-lagoon/15 bg-cream px-5 py-3 text-sm text-lagoon placeholder:text-lagoon/45 outline-none transition focus:outline-none focus:ring-1 focus:ring-rosewood focus:ring-offset-0 dark:border-cream-soft/15 dark:bg-lagoon-soft dark:text-cream-soft dark:placeholder:text-cream-soft/40"
        />
    </div>
</template>