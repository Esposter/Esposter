<script setup lang="ts" generic="T extends ItemEntityType<string>">
import type { ItemEntityType } from "@esposter/shared";
import type { VForm } from "vuetify/components";
import type { z } from "zod";

import { DIALOG_TRANSITION_DURATION_MS } from "@/services/vuetify/constants";

interface Props<T> {
  editedItem: T;
  isDirty: boolean;
  isEditFormValid: boolean;
  isSavable: boolean;
  name: string;
  originalItem?: T;
  schema: z.ZodType;
  title: string;
}

defineSlots<{ default: () => VNode; "prepend-actions"?: () => VNode; "prepend-form"?: () => VNode }>();
const dialog = defineModel<boolean>({ required: true });
const isFullScreenDialog = defineModel<boolean>("isFullScreenDialog", { required: true });
const { editedItem, isDirty, isEditFormValid, isSavable, name, originalItem, schema, title } = defineProps<Props<T>>();
const emit = defineEmits<{
  close: [];
  delete: [onComplete: (isSuccessful?: boolean) => void];
  save: [];
  "update:edit-form": [value: InstanceType<typeof VForm>];
}>();
const editForm = ref<InstanceType<typeof VForm>>();
const isConfirmCloseDialogOpen = ref(false);
const formId = useId();
// Instantiated at setup rather than per close: a composable created inside a watch callback sits outside the
// Component's effect scope, so its timer outlives unmount and emits into a destroyed component
const { start: startClose } = useTimeoutFn(
  () => {
    emit("close");
  },
  DIALOG_TRANSITION_DURATION_MS,
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
  <!-- Still Vuetify's dialog underneath, since the forms inside it are Vuetify's fields; the look is the library's -->
  <v-dialog
    class="ui-dialog"
    :model-value="dialog"
    :fullscreen="isFullScreenDialog"
    transition="ui-dialog-drop"
    :width="isFullScreenDialog ? '100%' : '50rem'"
    @update:model-value="
      (value) => {
        if (value) dialog = true;
        else if (isDirty) isConfirmCloseDialogOpen = true;
        else dialog = false;
      }
    "
  >
    <section :class="{ 'h-full': isFullScreenDialog }" flex flex-col max-h-full min-h-0 ui-frame>
      <StyledEditFormDialogHeader
        v-model:is-confirm-close-dialog-open="isConfirmCloseDialogOpen"
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
        :title
        @update:is-edit-form-dialog-open="dialog = $event"
        @save="emit('save')"
        @delete="emit('delete', $event)"
      >
        <template v-if="$slots['prepend-actions']" #prepend-actions>
          <slot name="prepend-actions" />
        </template>
      </StyledEditFormDialogHeader>
      <div p-3 flex flex-1 flex-col gap-4 of-y-auto>
        <slot name="prepend-form" />
        <v-form :id="formId" ref="editForm" @submit.prevent="emit('save')">
          <slot />
        </v-form>
      </div>
    </section>
  </v-dialog>
</template>
