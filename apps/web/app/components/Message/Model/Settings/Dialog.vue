<script setup lang="ts">
interface Props {
  // The dialog's accessible name: whose settings these are
  title: string;
}

// The frame a settings dialog is drawn in, the user's and a room's alike: a sidebar of what can be set beside the
// Panel of the one picked, held at one height so switching panels never moves the dialog. The header over the panel
// Names it and closes the dialog, so the dialog's own title bar is dropped
defineSlots<{ default: () => VNode }>();
const isOpen = defineModel<boolean>({ default: false });
const { title } = defineProps<Props>();
</script>

<template>
  <UiDialog v-model="isOpen" :title is-title-hidden w="[min(72rem,96vw)]">
    <div h="[76dvh]" flex min-h-0 relative ui-body>
      <slot />
    </div>
  </UiDialog>
</template>
