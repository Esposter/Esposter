<script setup lang="ts">
import type { StyledDialogActivatorSlotProps } from "@/components/Styled/Dialog.vue";
import type { VBtn, VCard } from "vuetify/components";

export interface StyledDeleteFormDialogProps {
  cardProps?: VCard["$props"];
  confirmButtonProps?: VBtn["$props"];
  // Azure-style destructive guard: Delete stays disabled until this exact text is typed
  confirmName?: string;
}

defineSlots<{
  activator: (props: StyledDialogActivatorSlotProps) => VNode;
  default: () => VNode;
}>();
const modelValue = defineModel<boolean>({ default: false });
const { cardProps, confirmButtonProps, confirmName = "" } = defineProps<StyledDeleteFormDialogProps>();
const emit = defineEmits<{ delete: [onComplete: (isSuccessful?: boolean) => void] }>();
const confirmNameValue = ref("");

watch(modelValue, (newModelValue) => {
  if (!newModelValue) confirmNameValue.value = "";
});
</script>

<template>
  <StyledFormDialog
    v-model="modelValue"
    :card-props
    :confirm-button-attrs="{ disabled: Boolean(confirmName) && confirmNameValue !== confirmName }"
    :confirm-button-props="{ color: 'error', text: 'Delete', ...confirmButtonProps }"
    @submit="(_event, onComplete) => emit('delete', onComplete)"
  >
    <template #activator="activatorProps">
      <slot name="activator" :="activatorProps" />
    </template>
    <slot />
    <v-text-field
      v-if="confirmName"
      v-model="confirmNameValue"
      mt-4
      :label="`Type '${confirmName}' to confirm`"
      autofocus
      hide-details
    />
  </StyledFormDialog>
</template>
