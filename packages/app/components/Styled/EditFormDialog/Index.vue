<script setup lang="ts" generic="T extends ItemEntityType<string>">
import type { ItemEntityType } from "@/shared/models/entity/ItemEntityType";

import Header from "@/components/Styled/EditFormDialog/Header.vue";
import { VForm } from "vuetify/components";

interface EditFormDialogProps<T> {
  editedItem: T;
  isEditFormValid: boolean;
  isFullScreenDialog: boolean;
  isSavable: boolean;
  name: string;
  originalItem?: T;
}

defineSlots<{ default: (props: Record<string, never>) => unknown }>();
const { editedItem, isEditFormValid, isFullScreenDialog, isSavable, name, originalItem } =
  defineProps<EditFormDialogProps<T>>();
const dialog = defineModel<boolean>({ required: true });
const emit = defineEmits<{
  close: [];
  delete: [onComplete: () => void];
  save: [];
  "update:edit-form-ref": [value: InstanceType<typeof VForm>];
  "update:fullscreen-dialog": [value: boolean];
}>();

watch(dialog, (newDialog) => {
  // Hack emitting the close event so the dialog content doesn't change
  // until after the CSS animation that lasts 300ms ends
  window.setTimeout(() => {
    if (!newDialog) emit("close");
  }, 300);
});

const editFormRef = ref<InstanceType<typeof VForm>>();

watch(editFormRef, (newEditFormRef) => {
  if (!newEditFormRef) return;
  emit("update:edit-form-ref", newEditFormRef);
});
</script>

<template>
  <v-dialog
    v-model="dialog"
    :fullscreen="isFullScreenDialog"
    :width="isFullScreenDialog ? '100%' : 800"
    persistent
    no-click-animation
  >
    <v-form ref="editFormRef" contents="!" @submit.prevent="emit('save')">
      <StyledCard>
        <Header
          :name
          :edited-item
          :original-item
          :edit-form-ref
          :is-edit-form-valid
          :is-full-screen-dialog
          :is-savable
          @update:edit-form-dialog="
            (value) => {
              dialog = value;
            }
          "
          @update:fullscreen-dialog="(value) => emit('update:fullscreen-dialog', value)"
          @save="emit('save')"
          @delete="(onComplete) => emit('delete', onComplete)"
        />
        <v-divider thickness="2" />
        <slot />
      </StyledCard>
    </v-form>
  </v-dialog>
</template>
