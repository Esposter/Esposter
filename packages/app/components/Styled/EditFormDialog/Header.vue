<script setup lang="ts" generic="T extends ItemEntityType<string>">
import type { ItemEntityType } from "@/models/shared/entity/ItemEntityType";
import type { VForm } from "vuetify/components";

import ConfirmCloseDialogButton from "@/components/Styled/EditFormDialog/ConfirmCloseDialogButton.vue";
import ConfirmDeleteDialogButton from "@/components/Styled/EditFormDialog/ConfirmDeleteDialogButton.vue";
import ErrorIcon from "@/components/Styled/EditFormDialog/ErrorIcon.vue";
import SaveButton from "@/components/Styled/EditFormDialog/SaveButton.vue";
import ToggleFullScreenDialogButton from "@/components/Styled/EditFormDialog/ToggleFullScreenDialogButton.vue";
import { prettifyName } from "@/util/text/prettifyName";

interface HeaderProps<T> {
  editedItem: T;
  editFormRef: InstanceType<typeof VForm> | undefined;
  isEditFormValid: boolean;
  isFullScreenDialog: boolean;
  isSavable: boolean;
  name: string;
  originalItem: null | T;
}

const { editedItem, editFormRef, isEditFormValid, isFullScreenDialog, isSavable, name, originalItem } =
  defineProps<HeaderProps<T>>();
const itemType = computed(() => prettifyName(editedItem.type));
const emit = defineEmits<{
  delete: [onComplete: () => void];
  save: [];
  "update:edit-form-dialog": [value: false];
  "update:fullscreen-dialog": [value: boolean];
}>();
</script>

<template>
  <v-toolbar pl-4 flex-none :title="`Configuration - ${itemType}`">
    <v-spacer />
    <ErrorIcon :edit-form-ref="editFormRef" :is-edit-form-valid="isEditFormValid" />
    <SaveButton :is-savable="isSavable" />
    <ConfirmDeleteDialogButton
      :name="name"
      :original-item="originalItem"
      @delete="(onComplete) => emit('delete', onComplete)"
    />
    <v-divider mx-2="!" thickness="2" inset vertical />
    <ToggleFullScreenDialogButton
      :is-full-screen-dialog="isFullScreenDialog"
      @click="(value) => emit('update:fullscreen-dialog', value)"
    />
    <ConfirmCloseDialogButton
      :edited-item="editedItem"
      :is-savable="isSavable"
      @update:edit-form-dialog="(value) => emit('update:edit-form-dialog', value)"
      @save="emit('save')"
    />
  </v-toolbar>
</template>

<style scoped lang="scss">
:deep(.v-toolbar__content) {
  height: auto !important;
  flex-wrap: wrap;
}

:deep(.v-toolbar-title) {
  flex: none;
}

:deep(.v-toolbar-title__placeholder) {
  overflow: initial;
}
</style>
