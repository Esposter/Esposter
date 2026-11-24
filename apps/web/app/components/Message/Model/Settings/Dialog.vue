<script setup lang="ts">
import { UiDialogSize } from "#src/models/ui/UiDialogSize";

interface Props {
  // The dialog's accessible name: whose settings these are
  title: string;
}
// The frame a settings dialog is drawn in, the user's and a room's alike.
// A sidebar of what can be set sits beside the panel of the one picked.
// The body is bare so the sidebar runs to the frame's edges.
// The frame is tall, so the dialog does not grow with the panel; the sidebar and the panel each scroll inside it.
// The header over the panel names it and closes the dialog, so the dialog's own title bar is dropped.
defineSlots<{ default: () => VNode }>();
const isOpen = defineModel<boolean>({ default: false });
defineProps<Props>();
</script>

<template>
  <UiDialog v-model="isOpen" :title is-body-bare is-tall is-title-hidden :size="UiDialogSize.Full">
    <div flex flex-1 h-full relative ui-body>
      <slot />
    </div>
  </UiDialog>
</template>
