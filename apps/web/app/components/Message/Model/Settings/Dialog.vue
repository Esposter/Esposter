<script setup lang="ts">
import { UiDialogSize } from "@/models/ui/UiDialogSize";

interface Props {
  // The dialog's accessible name: whose settings these are
  title: string;
}
// The frame a settings dialog is drawn in, the user's and a room's alike: a sidebar of what can be set beside the
// Panel of the one picked, with the body bare so the sidebar runs to the frame's edges. The frame is tall, so the dialog
// Does not grow with the panel, and the sidebar and the panel each scroll inside it. The header over the panel names it
// And closes the dialog, so the dialog's own title bar is dropped
defineSlots<{ default: () => VNode }>();
const isOpen = defineModel<boolean>({ default: false });
const { title } = defineProps<Props>();
</script>

<template>
  <UiDialog v-model="isOpen" :title is-body-bare is-tall is-title-hidden :size="UiDialogSize.Full">
    <div flex flex-1 min-h-0 relative ui-body>
      <slot />
    </div>
  </UiDialog>
</template>
