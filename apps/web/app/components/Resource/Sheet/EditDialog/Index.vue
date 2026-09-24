<script setup lang="ts">
import type { z } from "zod";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import deepEqual from "fast-deep-equal";

interface Props {
  editedValue: unknown;
  isCreate?: true;
  schema: z.ZodType;
  title: string;
  value: unknown;
}

defineSlots<{ default: () => VNode; "prepend-actions"?: () => VNode }>();
const modelValue = defineModel<boolean>({ default: false });
const { editedValue, isCreate, schema, title, value } = defineProps<Props>();
const emit = defineEmits<{ reset: []; submit: [onComplete: () => void] }>();
const styledDialog = useTemplateRef("styledDialog");
const errorIcon = useTemplateRef("errorIcon");
const isEqual = computed(() => deepEqual(value, editedValue));
const cardProps = computed(() => ({ title }));
const confirmButtonAttrs = computed(() => ({
  disabled: !(errorIcon.value?.isValid ?? true) || (!isCreate && isEqual.value),
}));
</script>

<template>
  <StyledFormDialog
    ref="styledDialog"
    v-model="modelValue"
    :card-props
    :confirm-button-attrs
    :confirm-button-props="{ text: 'Save & Close' }"
    @submit="(_event, onComplete) => emit('submit', onComplete)"
  >
    <template #prepend-actions>
      <StyledEditFormDialogErrorIcon
        ref="errorIcon"
        :edited-value
        :edit-form="styledDialog?.editForm"
        :is-edit-form-valid="styledDialog?.isEditFormValid ?? true"
        :schema
      />
      <UiButton :disabled="isEqual" :variant="UiButtonVariant.Quiet" @click="emit('reset')">Reset</UiButton>
      <slot name="prepend-actions" />
    </template>
    <slot />
  </StyledFormDialog>
</template>
