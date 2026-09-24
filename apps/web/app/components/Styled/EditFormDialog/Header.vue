<script setup lang="ts" generic="T extends ItemEntityType<string>">
import type { ItemEntityType } from "@esposter/shared";
import type { VForm } from "vuetify/components";
import type { z } from "zod";

import { prettify } from "@/util/text/prettify";

interface Props<T> {
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
  defineProps<Props<T>>();
const emit = defineEmits<{
  delete: [onComplete: (isSuccessful?: boolean) => void];
  save: [];
  "update:edit-form-dialog": [value: false];
}>();
const errorIcon = useTemplateRef("errorIcon");
</script>

<template>
  <header px-3 py-2 flex flex-wrap gap-2 items-center ui-bar>
    <h2 text-accent flex-1 min-w-0 truncate>Configuration - {{ prettify(editedItem.type) }}</h2>
    <div flex gap-1 items-center>
      <StyledEditFormDialogErrorIcon
        ref="errorIcon"
        :edit-form
        :is-edit-form-valid
        :schema
        :edited-value="editedItem"
      />
      <slot name="prepend-actions" />
      <StyledEditFormDialogSaveButton :form-id :is-savable="isSavable && (errorIcon?.isValid ?? true)" />
      <StyledEditFormDialogConfirmDeleteDialogButton :name :original-item @delete="emit('delete', $event)" />
      <!-- The item's own commands, then the dialog's -->
      <div aria-hidden="true" mx-1 bg-panel-edge h-6 w-1 />
      <StyledToggleFullScreenDialogButton v-model="isFullScreenDialog" />
      <StyledEditFormDialogConfirmCloseDialogButton
        v-model="confirmCloseDialog"
        :edited-item
        :is-dirty
        :is-savable
        @update:edit-form-dialog="emit('update:edit-form-dialog', $event)"
        @save="emit('save')"
      />
    </div>
  </header>
</template>
