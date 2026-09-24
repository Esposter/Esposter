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
const mergedCardProps = computed(() => ({ prependIcon: "i-mdi:delete-alert-outline", ...cardProps }));
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
      <div px-2 py-1 flex gap-2 items-center ui-sunk>
        <code flex-1 truncate>{{ confirmName }}</code>
        <UiCopyButton :source="confirmName" />
      </div>
      <UiTextField v-model="confirmNameValue" is-autofocus :label="`Type '${confirmName}' to confirm`" />
    </template>
  </StyledFormDialog>
</template>
