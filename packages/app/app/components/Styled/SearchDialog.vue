<script setup lang="ts">
import type { StyledDialogActivatorSlotProps } from "@/components/Styled/Dialog.vue";
import type { VDialog } from "vuetify/components";

export interface StyledSearchDialogProps {
  // Registered with useVHotkey to toggle the dialog, e.g. "ctrl+k"
  hotkey: string;
  placeholder: string;
}

const DIALOG_PROPS: VDialog["$props"] = { width: 600 };

defineSlots<{
  activator?: (props: StyledDialogActivatorSlotProps) => VNode;
  default: () => VNode;
}>();
const isOpen = defineModel<boolean>({ default: false });
const searchQuery = defineModel<string>("searchQuery", { required: true });
const { hotkey, placeholder } = defineProps<StyledSearchDialogProps>();

useVHotkey(hotkey, () => {
  isOpen.value = !isOpen.value;
});
</script>

<template>
  <!-- The field is the dialog's `header` rather than body content: results scroll, the thing you type in does not -->
  <StyledDialog v-model="isOpen" :dialog-props="DIALOG_PROPS" hide-toolbar-actions>
    <template #activator="activatorProps">
      <slot name="activator" :="activatorProps" />
    </template>
    <template #header>
      <v-text-field
        v-model="searchQuery"
        :placeholder
        autofocus
        clearable
        prepend-inner-icon="mdi-magnify"
        variant="solo"
        @click:clear="searchQuery = ''"
      />
    </template>
    <slot />
  </StyledDialog>
</template>
