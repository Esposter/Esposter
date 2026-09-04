<script setup lang="ts" generic="T extends ItemEntityType<string>">
import type { ItemEntityType } from "@esposter/shared";
import type { VForm } from "vuetify/components";
import type { z } from "zod";

import { prettify } from "@/util/text/prettify";

interface StyledEditFormDialogHeaderProps<T> {
  editedItem: T;
  editForm?: InstanceType<typeof VForm>;
  formId: string;
  isDirty: boolean;
  isEditFormValid: boolean;
  isSavable: boolean;
  name: string;
  originalItem?: T;
  schema: z.ZodType;
}

defineSlots<{ "prepend-actions": () => VNode }>();
const confirmCloseDialog = defineModel<boolean>("confirmCloseDialog", { required: true });
const isFullScreenDialog = defineModel<boolean>("isFullScreenDialog", { required: true });
const { editedItem, editForm, formId, isDirty, isEditFormValid, isSavable, name, originalItem, schema } =
  defineProps<StyledEditFormDialogHeaderProps<T>>();
const errorIcon = useTemplateRef("errorIcon");
const title = computed(() => `Configuration - ${prettify(editedItem.type)}`);
const emit = defineEmits<{
  delete: [onComplete: (isSuccessful?: boolean) => void];
  save: [];
  "update:edit-form-dialog": [value: false];
}>();
</script>

<template>
  <v-toolbar flex-none :title>
    <v-spacer />
    <StyledEditFormDialogErrorIcon ref="errorIcon" :edit-form :is-edit-form-valid :schema :edited-value="editedItem" />
    <slot name="prepend-actions" />
    <StyledEditFormDialogSaveButton :form-id :is-savable="isSavable && (errorIcon?.isValid ?? true)" />
    <StyledEditFormDialogConfirmDeleteDialogButton :name :original-item @delete="emit('delete', $event)" />
    <v-divider thickness="2" vertical inset mx-2 />
    <StyledToggleFullScreenDialogButton v-model="isFullScreenDialog" />
    <StyledEditFormDialogConfirmCloseDialogButton
      v-model="confirmCloseDialog"
      :edited-item
      :is-dirty
      :is-savable
      @update:edit-form-dialog="emit('update:edit-form-dialog', $event)"
      @save="emit('save')"
    />
  </v-toolbar>
</template>

<style scoped>
:deep(.v-toolbar__content) {
  flex-wrap: wrap;
}

:deep(.v-toolbar-title) {
  flex: none;
}

:deep(.v-toolbar-title__placeholder) {
  overflow: initial;
}
</style>
