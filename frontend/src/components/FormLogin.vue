<script setup>
import { useI18n } from 'vue-i18n'

defineProps({
  newPassword: { type: Boolean, default: false },
})

const email = defineModel('email', { type: String, default: '' })
const password = defineModel('password', { type: String, default: '' })

const { t } = useI18n()
</script>

<template>
    <div>
        <label for="login-email" class="sr-only">{{ t('auth.emailLabel') }}</label>
        <input
        id="login-email"
        v-model="email"
        type="email"
        autocomplete="email"
        required
        :placeholder="t('auth.emailLabel')"
        class="w-full rounded-full border border-lagoon/15 bg-cream px-5 py-3 text-sm text-lagoon placeholder:text-lagoon/45 outline-none transition focus:outline-none focus:ring-1 focus:ring-rosewood focus:ring-offset-0 dark:border-cream-soft/15 dark:bg-lagoon-soft dark:text-cream-soft dark:placeholder:text-cream-soft/40"
        />
    </div>

    <div>
        <label for="login-password" class="sr-only">{{ t('auth.passwordLabel') }}</label>
        <input
        id="login-password"
        v-model="password"
        type="password"
        required
        :autocomplete="newPassword ? 'new-password' : 'current-password'"
        :placeholder="t('auth.passwordLabel')"
        class="w-full rounded-full border border-lagoon/15 bg-cream px-5 py-3 text-sm text-lagoon placeholder:text-lagoon/45 outline-none transition focus:outline-none focus:ring-1 focus:ring-rosewood focus:ring-offset-0 dark:border-cream-soft/15 dark:bg-lagoon-soft dark:text-cream-soft dark:placeholder:text-cream-soft/40"
        />
    </div>
</template>