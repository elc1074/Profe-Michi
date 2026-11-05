import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAccountDeletionStore = defineStore('accountDeletion', () => {
  const status = ref('hidden')

  function start() {
    status.value = 'deleting'
  }

  function complete() {
    status.value = 'completed'
  }

  function close() {
    status.value = 'hidden'
  }

  return { status, start, complete, close }
})
