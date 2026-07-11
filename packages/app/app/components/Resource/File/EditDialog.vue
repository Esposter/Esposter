<script setup lang="ts">
import type { z } from "zod";

import deepEqual from "fast-deep-equal";

interface EditDialogProps {
  editedValue: unknown;
  isCreate?: true;
  schema: z.ZodType;
  title: string;
  value: unknown;
}

defineSlots<{ default: () => VNode; "prepend-actions"?: () => VNode }>();
const modelValue = defineModel<boolean>({ default: false });
const { editedValue, isCreate, schema, title, value } = defineProps<EditDialogProps>();
const emit = defineEmits<{ reset: []; submit: [onComplete: () => void] }>();
const styledDialog = useTemplateRef("styledDialog");
const errorIcon = useTemplateRef("errorIcon");
const isEqual = computed(() => deepEqual(value, editedValue));
const disabled = computed(() => !(errorIcon.value?.isValid ?? true) || (!isCreate && isEqual.value));
</script>

<template>
  <StyledFormDialog
    ref="styledDialog"
    v-model="modelValue"
    :card-props="{ title }"
    :confirm-button-attrs="{ disabled }"
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
      <v-tooltip text="Reset changes">
        <template #activator="{ props: tooltipProps }">
          <v-btn :disabled="isEqual" text="Reset" :="tooltipProps" @click="emit('reset')" />
        </template>
      </v-tooltip>
      <slot name="prepend-actions" />
    </template>
    <v-container fluid overflow-y-auto>
      <slot />
    </v-container>
  </StyledFormDialog>
</template>
