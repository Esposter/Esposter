<script setup lang="ts" generic="T extends ItemEntityType<string>">
import type { ItemEntityType } from "@esposter/shared";
import type { VForm } from "vuetify/components";
import type { z } from "zod";

import { dayjs } from "#shared/services/dayjs";

interface EditFormDialogProps<T> {
  editedItem: T;
  isEditFormValid: boolean;
  isFullScreenDialog: boolean;
  isSavable: boolean;
  name: string;
  originalItem?: T;
  schema: z.ZodType;
}

const slots = defineSlots<{ default: () => VNode; "prepend-actions": () => VNode; "prepend-form": () => VNode }>();
const dialog = defineModel<boolean>({ required: true });
const { editedItem, isEditFormValid, isFullScreenDialog, isSavable, name, originalItem, schema } =
  defineProps<EditFormDialogProps<T>>();
const emit = defineEmits<{
  close: [];
  delete: [onComplete: () => void];
  save: [];
  "update:edit-form-ref": [value: InstanceType<typeof VForm>];
  "update:fullscreen-dialog": [value: boolean];
}>();
const editFormRef = ref<InstanceType<typeof VForm>>();
const formId = useId();

watch(dialog, (newDialog) => {
  if (newDialog) return;
  useTimeoutFn(() => {
    emit("close");
  }, dayjs.duration(0.3, "seconds").asMilliseconds());
});

watch(editFormRef, (newEditFormRef) => {
  if (!newEditFormRef) return;
  emit("update:edit-form-ref", newEditFormRef);
});
</script>

<template>
  <v-dialog v-model="dialog" :fullscreen="isFullScreenDialog" :width="isFullScreenDialog ? '100%' : 800" persistent>
    <StyledCard>
      <StyledEditFormDialogHeader
        :name
        :edited-item
        :original-item
        :edit-form-ref
        :form-id
        :is-edit-form-valid
        :schema
        :is-full-screen-dialog
        :is-savable
        @update:edit-form-dialog="dialog = $event"
        @update:fullscreen-dialog="emit('update:fullscreen-dialog', $event)"
        @save="emit('save')"
        @delete="emit('delete', $event)"
      >
        <template v-if="$slots['prepend-actions']" #prepend-actions>
          <slot name="prepend-actions" />
        </template>
      </StyledEditFormDialogHeader>
      <v-divider thickness="2" />
      <v-container overflow-y-auto fluid>
        <slot name="prepend-form" />
        <v-form :id="formId" ref="editFormRef" @submit.prevent="emit('save')">
          <slot />
        </v-form>
      </v-container>
    </StyledCard>
  </v-dialog>
</template>
