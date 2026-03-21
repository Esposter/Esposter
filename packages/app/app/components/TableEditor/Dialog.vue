<script setup lang="ts">
interface TableEditorDialogProps {
  closeButtonText?: string;
  title: string;
}

const isOpen = defineModel<boolean>();
const { closeButtonText = "Close" } = defineProps<TableEditorDialogProps>();
const isFullScreen = ref(false);
</script>

<template>
  <v-dialog v-model="isOpen" :fullscreen="isFullScreen" max-width="900">
    <v-card :title>
      <template #append>
        <StyledToggleFullScreenDialogButton
          :is-full-screen-dialog="isFullScreen"
          @click="isFullScreen = $event"
        />
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
