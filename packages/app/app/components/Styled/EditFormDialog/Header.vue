<script setup lang="ts" generic="T extends ItemEntityType<string>">
import type { ItemEntityType } from "@esposter/shared";
import type { VForm } from "vuetify/components";
import type { z } from "zod";

import { prettify } from "@/util/text/prettify";

interface HeaderProps<T> {
  editedItem: T;
  editFormRef: InstanceType<typeof VForm> | undefined;
  formId: string;
  isEditFormValid: boolean;
  isFullScreenDialog: boolean;
  isSavable: boolean;
  name: string;
  originalItem?: T;
  schema: z.ZodType;
}

defineSlots<{ "prepend-actions": () => VNode }>();
const { editedItem, editFormRef, formId, isEditFormValid, isFullScreenDialog, isSavable, name, originalItem, schema } =
  defineProps<HeaderProps<T>>();
const itemType = computed(() => prettify(editedItem.type));
const emit = defineEmits<{
  delete: [onComplete: () => void];
  save: [];
  "update:edit-form-dialog": [value: false];
  "update:fullscreen-dialog": [value: boolean];
}>();
</script>

<template>
  <v-toolbar flex-none pl-4 :title="`Configuration - ${itemType}`">
    <v-spacer />
    <StyledEditFormDialogErrorIcon :edit-form-ref :is-edit-form-valid :schema :edited-value="editedItem" />
    <slot name="prepend-actions" />
    <StyledEditFormDialogSaveButton :form-id :is-savable />
    <StyledEditFormDialogConfirmDeleteDialogButton :name :original-item @delete="emit('delete', $event)" />
    <v-divider mx-2 thickness="2" vertical inset />
    <StyledEditFormDialogToggleFullScreenDialogButton
      :is-full-screen-dialog
      @click="emit('update:fullscreen-dialog', $event)"
    />
    <StyledEditFormDialogConfirmCloseDialogButton
      :edited-item
      :is-savable
      @update:edit-form-dialog="emit('update:edit-form-dialog', $event)"
      @save="emit('save')"
    />
  </v-toolbar>
</template>

<style scoped lang="scss">
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
