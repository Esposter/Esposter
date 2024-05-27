<script setup lang="ts" generic="T extends ItemEntityType<string>">
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import Header from "@/components/Styled/EditFormDialog/Header.vue";
import type { ItemEntityType } from "@/models/shared/entity/ItemEntityType";
import { VForm } from "vuetify/components";

interface EditFormDialogProps<T> {
  name: string;
  editedItem: T;
  originalItem: T | null;
  editFormRef: InstanceType<typeof VForm> | undefined;
  isEditFormValid: boolean;
  isFullScreenDialog: boolean;
  isSavable: boolean;
}

defineSlots<{ default: (props: Record<string, never>) => unknown }>();
const { name, editedItem, originalItem, editFormRef, isEditFormValid, isFullScreenDialog, isSavable } =
  defineProps<EditFormDialogProps<T>>();
const dialog = defineModel<boolean>({ required: true });
const emit = defineEmits<{
  "update:edit-form-ref": [value: InstanceType<typeof VForm>];
  "update:fullscreen-dialog": [value: boolean];
  save: [];
  delete: [onComplete: () => void];
  reset: [];
}>();

watch(dialog, (newDialog) => {
  // Hack resetting the item so the dialog content doesn't change
  // until after the CSS animation that lasts 300ms ends
  window.setTimeout(() => {
    if (!newDialog) emit("reset");
  }, 300);
});

const formRef = ref<InstanceType<typeof VForm>>();

watch(formRef, (newFormRef) => {
  if (!newFormRef) return;
  emit("update:edit-form-ref", newFormRef);
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
    <v-form ref="formRef" contents="!" @submit="({ preventDefault }) => preventDefault()">
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
