<script setup lang="ts" generic="T extends ItemEntityType<string>">
import type { ItemEntityType } from "@esposter/shared";
import type { VForm } from "vuetify/components";

import { prettify } from "@/util/text/prettify";

interface HeaderProps<T> {
  editedItem: T;
  editFormRef: InstanceType<typeof VForm> | undefined;
  isEditFormValid: boolean;
  isFullScreenDialog: boolean;
  isSavable: boolean;
  name: string;
  originalItem?: T;
}

const { editedItem, editFormRef, isEditFormValid, isFullScreenDialog, isSavable, name, originalItem } =
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
    <StyledEditFormDialogErrorIcon :edit-form-ref :is-edit-form-valid />
    <StyledEditFormDialogSaveButton :is-savable />
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
