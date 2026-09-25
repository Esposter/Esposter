<script setup lang="ts">
import type { Promisable } from "type-fest";
import type { z } from "zod";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import deepEqual from "fast-deep-equal";

interface Props {
  editedValue: unknown;
  isCreate?: true;
  schema: z.ZodType;
  // A sheet command, applied on the spot and saved behind it, so the dialog goes the moment it is called
  submit: () => Promisable<unknown>;
  title: string;
  value: unknown;
}

defineSlots<{ default: () => VNode; "prepend-actions"?: () => VNode }>();
const modelValue = defineModel<boolean>({ default: false });
const { editedValue, isCreate, schema, submit, title, value } = defineProps<Props>();
const emit = defineEmits<{ reset: [] }>();
const styledDialog = useTemplateRef("styledDialog");
const errorIcon = useTemplateRef("errorIcon");
const isEqual = computed(() => deepEqual(value, editedValue));
</script>

<template>
  <StyledFormDialog
    ref="styledDialog"
    v-model="modelValue"
    confirm-label="Save & Close"
    :is-confirm-disabled="!(errorIcon?.isValid ?? true) || (!isCreate && isEqual) || undefined"
    is-optimistic
    :submit
    :title
  >
    <template #prepend-actions>
      <StyledEditFormDialogErrorIcon
        ref="errorIcon"
        :edited-value
        :is-form-valid="styledDialog?.isValid ?? true"
        :schema
      />
      <UiButton :disabled="isEqual" :variant="UiButtonVariant.Quiet" @click="emit('reset')">Reset</UiButton>
      <slot name="prepend-actions" />
    </template>
    <slot />
  </StyledFormDialog>
</template>
