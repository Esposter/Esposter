<script setup lang="ts" generic="T extends ItemEntityType<string>">
import ConfirmCloseDialogButton from "@/components/Styled/EditFormDialog/ConfirmCloseDialogButton.vue";
import ConfirmDeleteDialogButton from "@/components/Styled/EditFormDialog/ConfirmDeleteDialogButton.vue";
import ErrorIcon from "@/components/Styled/EditFormDialog/ErrorIcon.vue";
import SaveButton from "@/components/Styled/EditFormDialog/SaveButton.vue";
import ToggleFullScreenDialogButton from "@/components/Styled/EditFormDialog/ToggleFullScreenDialogButton.vue";
import type { ItemEntityType } from "@/models/shared/entity/ItemEntityType";
import { prettifyName } from "@/util/text/prettifyName";
import type { VForm } from "vuetify/components";

interface HeaderProps<T> {
  name: string;
  editedItem: T;
  editedIndex: number;
  originalItem: T;
  editFormRef: InstanceType<typeof VForm> | undefined;
  isEditFormValid: boolean;
  isFullScreenDialog: boolean;
  isSavable: boolean;
}

const { name, editedItem, originalItem, editFormRef, isEditFormValid, isFullScreenDialog, isSavable } =
  defineProps<HeaderProps<T>>();
const itemType = computed(() => prettifyName(editedItem.type));
const emit = defineEmits<{
  "update:edit-form-dialog": [value: false];
  "update:fullscreen-dialog": [value: boolean];
  save: [];
  delete: [onComplete: () => void];
}>();
</script>

<template>
  <v-toolbar flex-none :title="`Configuration - ${itemType}`">
    <v-spacer />
    <ErrorIcon :edit-form-ref :is-edit-form-valid />
    <SaveButton :is-savable @save="emit('save')" />
    <ConfirmDeleteDialogButton
      :name
      :edited-item
      :edited-index
      :original-item
      @delete="(onComplete) => emit('delete', onComplete)"
    />
    <v-divider mx-2="!" thickness="2" inset vertical />
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
