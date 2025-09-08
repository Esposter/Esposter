<script setup lang="ts" generic="T extends ItemEntityType<string>">
import type { ItemEntityType } from "#shared/models/entity/ItemEntityType";
import type { VForm } from "vuetify/components";

import { dayjs } from "#shared/services/dayjs";
import Header from "@/components/Styled/EditFormDialog/Header.vue";

interface EditFormDialogProps<T> {
  editedItem: T;
  isEditFormValid: boolean;
  isFullScreenDialog: boolean;
  isSavable: boolean;
  name: string;
  originalItem?: T;
}

defineSlots<{ default: () => VNode }>();
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
  if (newDialog) return;
  useTimeoutFn(() => {
    emit("close");
  }, dayjs.duration(0.3, "seconds").asMilliseconds());
});

const editFormRef = ref<InstanceType<typeof VForm>>();

watch(editFormRef, (newEditFormRef) => {
  if (!newEditFormRef) return;
  emit("update:edit-form-ref", newEditFormRef);
});
</script>

<template>
  <v-dialog v-model="dialog" :fullscreen="isFullScreenDialog" :width="isFullScreenDialog ? '100%' : 800" persistent>
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
          @update:edit-form-dialog="dialog = $event"
          @update:fullscreen-dialog="emit('update:fullscreen-dialog', $event)"
          @save="emit('save')"
          @delete="emit('delete', $event)"
        />
        <v-divider thickness="2" />
        <slot />
      </StyledCard>
    </v-form>
  </v-dialog>
</template>
