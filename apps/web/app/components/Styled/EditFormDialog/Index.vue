<script setup lang="ts" generic="T extends ItemEntityType<string>">
import type { ItemEntityType } from "@esposter/shared";
import type { z } from "zod";

import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
import { DIALOG_CLOSE_DURATION_MS } from "@/services/ui/constants";

interface Props<T> {
  editedItem: T;
  isDirty: boolean;
  isSavable: boolean;
  name: string;
  originalItem?: T;
  schema: z.ZodType;
  title: string;
}

defineSlots<{ default: () => VNode; "prepend-actions"?: () => VNode; "prepend-form"?: () => VNode }>();
const isOpen = defineModel<boolean>({ required: true });
const isFullScreenDialog = defineModel<boolean>("isFullScreenDialog", { required: true });
const isEditFormValid = defineModel<boolean>("isEditFormValid", { required: true });
const { editedItem, isDirty, isSavable, name, originalItem, schema, title } = defineProps<Props<T>>();
const emit = defineEmits<{
  close: [];
  delete: [onComplete: (isSuccessful?: boolean) => void];
  save: [];
}>();
const isConfirmCloseDialogOpen = ref(false);
const formId = useId();
// Instantiated at setup rather than per close: a composable created inside a watch callback sits outside the
// Component's effect scope, so its timer outlives unmount and emits into a destroyed component
const { start: startClose } = useTimeoutFn(
  () => {
    emit("close");
  },
  DIALOG_CLOSE_DURATION_MS,
  { immediate: false },
);
useConfirmBeforeNavigation(() => isDirty);

watch(isOpen, (newIsOpen) => {
  if (newIsOpen) return;
  // The form mounts with each open, so the verdict on this one does not carry over to the next
  isEditFormValid.value = true;
  startClose();
});
</script>

<template>
  <!-- The item's kind and name head the dialog in its own header, so the dialog's title is its accessible name alone.
    A close asked for while there are unsaved changes asks first -->
  <UiDialog
    :model-value="isOpen"
    is-title-hidden
    :placement="isFullScreenDialog ? UiDialogPlacement.FullScreen : UiDialogPlacement.High"
    :title
    :class="{ 'w-[min(50rem,90vw)]': !isFullScreenDialog }"
    @update:model-value="
      (value) => {
        if (value) isOpen = true;
        else if (isDirty) isConfirmCloseDialogOpen = true;
        else isOpen = false;
      }
    "
  >
    <!-- Held through the dialog's leave, so it rises out with what it showed rather than as an empty frame -->
    <Transition :duration="{ enter: 0, leave: DIALOG_CLOSE_DURATION_MS }">
      <div v-if="isOpen" contents>
        <StyledEditFormDialogHeader
          v-model:is-confirm-close-dialog-open="isConfirmCloseDialogOpen"
          v-model:is-full-screen-dialog="isFullScreenDialog"
          :name
          :edited-item
          :original-item
          :form-id
          :is-dirty
          :is-edit-form-valid
          :schema
          :is-savable
          :title
          @update:is-edit-form-dialog-open="isOpen = $event"
          @save="emit('save')"
          @delete="emit('delete', $event)"
        >
          <template v-if="$slots['prepend-actions']" #prepend-actions>
            <slot name="prepend-actions" />
          </template>
        </StyledEditFormDialogHeader>
        <div p-3 flex flex-1 flex-col gap-4 min-h-0 of-y-auto>
          <slot name="prepend-form" />
          <UiForm :id="formId" v-model:is-valid="isEditFormValid" @submit="emit('save')">
            <slot />
          </UiForm>
        </div>
      </div>
    </Transition>
  </UiDialog>
</template>
