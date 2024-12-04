<script setup lang="ts">
interface ToggleFullScreenDialogButtonProps {
  isFullScreenDialog: boolean;
}

const { isFullScreenDialog } = defineProps<ToggleFullScreenDialogButtonProps>();
const emit = defineEmits<{ click: [value: boolean] }>();
</script>

<template>
  <v-tooltip :text="isFullScreenDialog ? 'Exit full screen mode' : 'Enter full screen mode'">
    <template #activator="{ props }">
      <v-btn
        :icon="isFullScreenDialog ? 'mdi-fullscreen-exit' : 'mdi-fullscreen'"
        :="props"
        @click="emit('click', !isFullScreenDialog)"
      />
    </template>
  </v-tooltip>
</template>
