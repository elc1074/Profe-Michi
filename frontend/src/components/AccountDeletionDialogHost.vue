<script setup>
import { computed } from 'vue'
import AccountDeletionDialog from './AccountDeletionDialog.vue'
import { useAccountDeletionStore } from '../stores/accountDeletion'

const accountDeletion = useAccountDeletionStore()
const showDialog = computed(() => accountDeletion.status !== 'hidden')
</script>

<template>
  <AccountDeletionDialog
    v-if="showDialog"
    :status="accountDeletion.status"
    @close="accountDeletion.close"
  />
</template>
