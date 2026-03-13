<script setup lang="ts">
import type { VForm } from "vuetify/components";
import type { z } from "zod";

import deepEqual from "fast-deep-equal";

interface EditDialogButtonProps {
  editedValue: unknown;
  schema: z.ZodType;
  title: string;
  tooltipText: string;
  value: unknown;
}

defineSlots<{ default: () => VNode }>();
const { editedValue, schema, title, tooltipText, value } = defineProps<EditDialogButtonProps>();
const emit = defineEmits<{ submit: [onComplete: () => void] }>();
const editFormRef = ref<InstanceType<typeof VForm>>();
const isEditFormValid = ref(true);
const errorIconRef = useTemplateRef("errorIcon");
const disabled = computed(() => !(errorIconRef.value?.isValid.value ?? true) || deepEqual(value, editedValue));
</script>

<template>
  <StyledDialog
    :card-props="{ title }"
    :confirm-button-props="{ text: 'Save & Close' }"
    :confirm-button-attrs="{ disabled }"
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
      <StyledEditFormDialogErrorIcon ref="errorIcon" :edit-form-ref :is-edit-form-valid :schema :edited-value />
    </template>
    <v-form ref="editFormRef" v-model="isEditFormValid">
      <slot />
    </v-form>
  </StyledDialog>
</template>
