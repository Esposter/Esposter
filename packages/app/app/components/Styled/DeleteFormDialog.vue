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
    :card-props="{ prependIcon: 'mdi-delete-alert-outline', ...cardProps }"
    :confirm-button-attrs="{ disabled: Boolean(confirmName) && confirmNameValue !== confirmName }"
    :confirm-button-props="{ color: 'error', text: 'Delete', ...confirmButtonProps }"
    @submit="(_event, onComplete) => emit('delete', onComplete)"
  >
    <template #activator="activatorProps">
      <slot name="activator" :="activatorProps" />
    </template>
    <slot />
    <template v-if="confirmName">
      <div flex gap-x-2 items-center>
        <v-code flex-1 truncate>{{ confirmName }}</v-code>
        <StyledClipboardIconButton :source="confirmName" />
      </div>
      <v-text-field
        v-model="confirmNameValue"
        :label="`Type '${confirmName}' to confirm`"
        autofocus
        density="compact"
        hide-details
      />
    </template>
  </StyledFormDialog>
</template>
