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
  // What the item is called as it is being edited, so the heading follows the name field as the reader types
  title: string;
}

defineSlots<{ "prepend-actions": () => VNode }>();
const confirmCloseDialog = defineModel<boolean>("confirmCloseDialog", { required: true });
const isFullScreenDialog = defineModel<boolean>("isFullScreenDialog", { required: true });
const { editedItem, editForm, formId, isDirty, isEditFormValid, isSavable, name, originalItem, schema, title } =
  defineProps<Props<T>>();
const emit = defineEmits<{
  delete: [onComplete: (isSuccessful?: boolean) => void];
  save: [];
  "update:edit-form-dialog": [value: false];
}>();
const errorIcon = useTemplateRef("errorIcon");
</script>

<template>
  <header px-3 py-2 flex flex-wrap gap-2 ui-bar items-center>
    <hgroup flex-1 min-w-0>
      <p text-sm text-muted>{{ prettify(editedItem.type) }}</p>
      <h2 truncate ui-heading>{{ title }}</h2>
    </hgroup>
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
      <div aria-hidden="true" mx-1 bg-border h-6 w="[var(--ui-border-width)]" />
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
