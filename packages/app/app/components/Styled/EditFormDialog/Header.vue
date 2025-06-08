<script setup lang="ts" generic="T extends ItemEntityType<string>">
import type { ItemEntityType } from "#shared/models/entity/ItemEntityType";
import type { VForm } from "vuetify/components";

import ConfirmCloseDialogButton from "@/components/Styled/EditFormDialog/ConfirmCloseDialogButton.vue";
import ConfirmDeleteDialogButton from "@/components/Styled/EditFormDialog/ConfirmDeleteDialogButton.vue";
import ErrorIcon from "@/components/Styled/EditFormDialog/ErrorIcon.vue";
import SaveButton from "@/components/Styled/EditFormDialog/SaveButton.vue";
import ToggleFullScreenDialogButton from "@/components/Styled/EditFormDialog/ToggleFullScreenDialogButton.vue";
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
    <ErrorIcon :edit-form-ref :is-edit-form-valid />
    <SaveButton :is-savable />
    <ConfirmDeleteDialogButton :name :original-item @delete="(onComplete) => emit('delete', onComplete)" />
    <v-divider mx-2="!" thickness="2" vertical inset />
    <ToggleFullScreenDialogButton :is-full-screen-dialog @click="(value) => emit('update:fullscreen-dialog', value)" />
    <ConfirmCloseDialogButton
      :edited-item
      :is-savable
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
