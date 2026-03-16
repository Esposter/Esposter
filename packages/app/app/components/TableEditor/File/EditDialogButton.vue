<script setup lang="ts">
import type StyledDialog from "@/components/Styled/Dialog.vue";
import type StyledEditFormDialogErrorIcon from "@/components/Styled/EditFormDialog/ErrorIcon.vue";
import type { z } from "zod";

import deepEqual from "fast-deep-equal";

interface EditDialogButtonProps {
  editedValue: unknown;
  icon?: string;
  schema: z.ZodType;
  title: string;
  tooltipText: string;
  value: unknown;
}

defineSlots<{ default: () => VNode; "prepend-actions"?: () => VNode }>();
const { editedValue, icon = "mdi-pencil", schema, title, tooltipText, value } = defineProps<EditDialogButtonProps>();
const emit = defineEmits<{ submit: [onComplete: () => void] }>();
const styledDialog = useTemplateRef<InstanceType<typeof StyledDialog>>("styledDialog");
const errorIcon = useTemplateRef<InstanceType<typeof StyledEditFormDialogErrorIcon>>("errorIcon");
const disabled = computed(() => !(errorIcon.value?.isValid ?? true) || deepEqual(value, editedValue));
</script>

<template>
  <StyledDialog
    ref="styledDialog"
    :card-props="{ title }"
    :confirm-button-props="{ text: 'Save & Close' }"
    :confirm-button-attrs="{ disabled }"
    @submit="(_event, onComplete) => emit('submit', onComplete)"
  >
    <template #activator="{ updateIsOpen }">
      <v-tooltip :text="tooltipText">
        <template #activator="{ props: tooltipProps }">
          <v-btn m-0 :icon size="small" tile :="tooltipProps" @click.stop="updateIsOpen(true)" />
        </template>
      </v-tooltip>
    </template>
    <template #prepend-actions>
      <StyledEditFormDialogErrorIcon
        ref="errorIcon"
        :edit-form="styledDialog?.editForm"
        :is-edit-form-valid="styledDialog?.isEditFormValid ?? true"
        :schema
        :edited-value
      />
      <slot name="prepend-actions" />
    </template>
    <v-container overflow-y-auto fluid>
      <slot />
    </v-container>
  </StyledDialog>
</template>
