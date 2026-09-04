<script setup lang="ts">
interface Props {
  closeButtonText?: string;
  title: string;
}

defineSlots<{ actions?: () => VNode; default: () => VNode }>();
const isOpen = defineModel<boolean>({ default: false });
const { closeButtonText = "Close" } = defineProps<Props>();
const isFullScreen = ref(false);
</script>

<template>
  <v-dialog v-model="isOpen" :fullscreen="isFullScreen">
    <v-card :title>
      <template #append>
        <StyledToggleFullScreenDialogButton v-model="isFullScreen" />
      </template>
      <v-card-text>
        <slot />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <slot name="actions" />
        <v-btn @click="isOpen = false">{{ closeButtonText }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
