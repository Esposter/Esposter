<script setup lang="ts">
import type { VForm } from "vuetify/components";
import type { z } from "zod";

interface EditDialogButtonProps {
  disabled?: boolean;
  schema?: z.ZodType;
  title: string;
  tooltipText: string;
  value?: unknown;
}

defineSlots<{ default: () => VNode }>();
const { disabled = false, schema, title, tooltipText, value } = defineProps<EditDialogButtonProps>();
const emit = defineEmits<{ submit: [onComplete: () => void] }>();
const editFormRef = ref<InstanceType<typeof VForm>>();
const isEditFormValid = ref(true);
const schemaError = ref("");

watchDeep(
  () => [schema, value] as const,
  ([newSchema, newValue]) => {
    if (!newSchema) {
      schemaError.value = "";
      return;
    }
    const result = newSchema.safeParse(newValue);
    schemaError.value = result.success ? "" : result.error.message;
  },
);
</script>

<template>
  <StyledDialog
    :card-props="{ title }"
    :confirm-button-props="{ text: 'Save & Close' }"
    :confirm-button-attrs="{ disabled: !isEditFormValid || !!schemaError || disabled }"
    @submit="(_event, onComplete) => emit('submit', onComplete)"
  >
    <template #activator="{ updateIsOpen }">
      <v-tooltip :text="tooltipText">
        <template #activator="{ props: tooltipProps }">
          <v-btn m-0 icon="mdi-pencil" size="small" tile :="tooltipProps" @click.stop="updateIsOpen(true)" />
        </template>
      </v-tooltip>
    </template>
    <template #prepend-actions>
      <StyledEditFormDialogErrorIcon :edit-form-ref :is-edit-form-valid :schema :value />
    </template>
    <v-form ref="editFormRef" v-model="isEditFormValid">
      <slot />
    </v-form>
  </StyledDialog>
</template>
