<script setup lang="ts">
import type { DeleteFormDialogProps } from "@/components/Styled/DeleteFormDialogProps";
import type { DialogActivatorSlotProps } from "@/components/Styled/DialogActivatorSlotProps";
import type { VBtn, VCard } from "vuetify/components";

defineSlots<{
  activator: (props: DialogActivatorSlotProps) => VNode;
  default: () => VNode;
}>();
const modelValue = defineModel<boolean>({ default: false });
const { cardProps, confirmButtonProps, confirmName = "" } = defineProps<DeleteFormDialogProps>();
const emit = defineEmits<{ delete: [onComplete: (isSuccessful?: boolean) => void] }>();
const confirmNameValue = ref("");
const mergedCardProps = computed(() => ({ prependIcon: "mdi-delete-alert-outline", ...cardProps }));
const mergedConfirmButtonProps = computed(() => ({ color: "error", text: "Delete", ...confirmButtonProps }));
const confirmButtonAttrs = computed(() => ({
  disabled: Boolean(confirmName) && confirmNameValue.value !== confirmName,
}));

watch(modelValue, (newModelValue) => {
  if (!newModelValue) confirmNameValue.value = "";
});
</script>

<template>
  <StyledFormDialog
    v-model="modelValue"
    :card-props="mergedCardProps"
    :confirm-button-attrs
    :confirm-button-props="mergedConfirmButtonProps"
    @submit="(_event, onComplete) => emit('delete', onComplete)"
  >
    <template #activator="activatorProps">
      <slot name="activator" :="activatorProps" />
    </template>
    <slot />
    <template v-if="confirmName">
      <v-code flex gap-x-2 items-center>
        <span flex-1 truncate>{{ confirmName }}</span>
        <StyledClipboardIconButton :source="confirmName" />
      </v-code>
      <v-text-field
        v-model="confirmNameValue"
        :label="`Type '${confirmName}' to confirm`"
        autofocus
        density="compact"
      />
    </template>
  </StyledFormDialog>
</template>
