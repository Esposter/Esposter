<script setup lang="ts">
import type { VForm } from "vuetify/components";
import type { z } from "zod";

import StyledEditFormDialogErrorIcon from "@/components/Styled/EditFormDialog/ErrorIcon.vue";
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
const editForm = ref<InstanceType<typeof VForm>>();
const isEditFormValid = ref(true);
const errorIcon = useTemplateRef<InstanceType<typeof StyledEditFormDialogErrorIcon>>("errorIcon");
const disabled = computed(() => !(errorIcon.value?.isValid ?? true) || deepEqual(value, editedValue));
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
      <StyledEditFormDialogErrorIcon ref="errorIcon" :edit-form :is-edit-form-valid :schema :edited-value />
    </template>
    <v-container overflow-y-auto fluid>
      <v-form ref="editForm" v-model="isEditFormValid">
        <slot />
      </v-form>
    </v-container>
  </StyledDialog>
</template>
