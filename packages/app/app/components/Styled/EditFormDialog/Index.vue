<script setup lang="ts" generic="T extends ItemEntityType<string>">
import type { ItemEntityType } from "@esposter/shared";
import type { VForm } from "vuetify/components";
import type { z } from "zod";

interface StyledEditFormDialogProps<T> {
  editedItem: T;
  isDirty: boolean;
  isEditFormValid: boolean;
  isSavable: boolean;
  name: string;
  originalItem?: T;
  schema: z.ZodType;
}

defineSlots<{ default: () => VNode; "prepend-actions"?: () => VNode; "prepend-form"?: () => VNode }>();
const dialog = defineModel<boolean>({ required: true });
const isFullScreenDialog = defineModel<boolean>("isFullScreenDialog", { required: true });
const { editedItem, isDirty, isEditFormValid, isSavable, name, originalItem, schema } =
  defineProps<StyledEditFormDialogProps<T>>();
const emit = defineEmits<{
  close: [];
  delete: [onComplete: (isSuccessful?: boolean) => void];
  save: [];
  "update:edit-form": [value: InstanceType<typeof VForm>];
}>();
const editForm = ref<InstanceType<typeof VForm>>();
const confirmCloseDialog = ref(false);
const formId = useId();
// Instantiated at setup rather than per close: a composable created inside a watch callback sits outside the
// Component's effect scope, so its timer outlives unmount and emits into a destroyed component
const { start: startClose } = useTimeoutFn(
  () => {
    emit("close");
  },
  300,
  { immediate: false },
);
useConfirmBeforeNavigation(() => isDirty);

watch(dialog, (newDialog) => {
  if (newDialog) return;
  startClose();
});

watch(editForm, (newEditForm) => {
  if (!newEditForm) return;
  emit("update:edit-form", newEditForm);
});
</script>

<template>
  <v-dialog
    :model-value="dialog"
    :fullscreen="isFullScreenDialog"
    :width="isFullScreenDialog ? '100%' : 800"
    @update:model-value="
      (value) => {
        if (value) dialog = true;
        else if (isDirty) confirmCloseDialog = true;
        else dialog = false;
      }
    "
  >
    <StyledCard>
      <StyledEditFormDialogHeader
        v-model:confirm-close-dialog="confirmCloseDialog"
        v-model:is-full-screen-dialog="isFullScreenDialog"
        :name
        :edited-item
        :original-item
        :edit-form
        :form-id
        :is-dirty
        :is-edit-form-valid
        :schema
        :is-savable
        @update:edit-form-dialog="dialog = $event"
        @save="emit('save')"
        @delete="emit('delete', $event)"
      >
        <template v-if="$slots['prepend-actions']" #prepend-actions>
          <slot name="prepend-actions" />
        </template>
      </StyledEditFormDialogHeader>
      <v-divider thickness="2" />
      <v-container fluid overflow-y-auto>
        <slot name="prepend-form" />
        <v-form :id="formId" ref="editForm" @submit.prevent="emit('save')">
          <slot />
        </v-form>
      </v-container>
    </StyledCard>
  </v-dialog>
</template>
