<script setup lang="ts">
import { useTableEditorStore } from "@/store/tableEditor";

defineSlots<{ default: (props: {}) => unknown }>();

const tableEditorStore = useTableEditorStore()();
const { resetItem } = tableEditorStore;
const { editFormRef, editFormDialog, isFullScreenDialog } = storeToRefs(tableEditorStore);

watch(editFormDialog, (newValue) => {
  // Hack resetting the item so the dialog content doesn't change
  // until after the CSS animation that lasts 300ms ends
  window.setTimeout(() => {
    if (!newValue) resetItem();
  }, 300);
});
</script>

<template>
  <v-dialog
    v-model="editFormDialog"
    :fullscreen="isFullScreenDialog"
    :width="isFullScreenDialog ? '100%' : 800"
    persistent
    no-click-animation
  >
    <v-form ref="editFormRef" contents @submit="(e) => e.preventDefault()">
      <StyledCard>
        <Header />
        <v-divider thickness="2" />
        <slot />
      </StyledCard>
    </v-form>
  </v-dialog>
</template>
