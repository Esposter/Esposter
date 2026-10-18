<script setup lang="ts" generic="T">
import type { Promisable } from "type-fest";
import type { z } from "zod";

import { DIALOG_BODY_TRANSITION_DURATION, DIALOG_CLOSE_DURATION_MS } from "@/services/ui/constants";
import { prettify } from "@/util/text/prettify";

interface Props<T> {
  editedItem: T;
  isDirty: boolean;
  isSavable: boolean;
  // What the item is, as its title bar and its confirmations name it: a todo, a chart
  itemType: string;
  name: string;
  originalItem?: T;
  // Deleting the original item, offered only when there is one
  remove?: () => Promisable<unknown>;
  // Awaited with Save pending, so a failed save keeps the dialog and its draft to try again (useDialogAnswer)
  save: () => Promisable<unknown>;
  schema: z.ZodType;
  // What the item is called as it is being edited, so the title follows the name field as the reader types
  title: string;
}

defineSlots<{ default: () => VNode; "prepend-actions"?: () => VNode; "prepend-form"?: () => VNode }>();
const isOpen = defineModel<boolean>({ required: true });
const isEditFormValid = defineModel<boolean>("isEditFormValid", { required: true });
const { editedItem, isDirty, isSavable, itemType, name, originalItem, remove, save, schema, title } =
  defineProps<Props<T>>();
const emit = defineEmits<{ close: [] }>();
const { answer, isPending } = useDialogAnswer(isOpen);
const isConfirmCloseDialogOpen = ref(false);
const formId = useId();
const errorIcon = useTemplateRef("errorIcon");
// Instantiated at setup rather than per close: a composable created inside a watch callback sits outside the
// Component's effect scope, so its timer outlives unmount and emits into a destroyed component
const { start: startClose, stop: stopClose } = useTimeoutFn(
  () => {
    emit("close");
  },
  DIALOG_CLOSE_DURATION_MS,
  { immediate: false },
);
useConfirmBeforeNavigation(() => isDirty);

watch(isOpen, (newIsOpen) => {
  // A reopen inside the leave takes back the close, so the item the reader is back to edit is not reset under them
  if (newIsOpen) {
    stopClose();
    return;
  }
  // The form mounts with each open, so the verdict on this one does not carry over to the next
  isEditFormValid.value = true;
  startClose();
});
</script>

<template>
  <!-- The library's dialog high on the page, the item's kind over its name in the title bar, its own commands before
    The dialog's full screen and close. A close asked for while there are unsaved changes asks first -->
  <UiDialog
    :model-value="isOpen"
    is-expandable
    :overline="prettify(itemType)"
    :title
    w="[min(50rem,90vw)]"
    @update:model-value="
      (value) => {
        if (value) isOpen = true;
        else if (isDirty) isConfirmCloseDialogOpen = true;
        else isOpen = false;
      }
    "
  >
    <template #actions>
      <!-- Held through the dialog's leave with the form, so the bar rises out whole -->
      <Transition :duration="DIALOG_BODY_TRANSITION_DURATION">
        <div v-if="isOpen" contents>
          <StyledEditFormDialogErrorIcon
            ref="errorIcon"
            :is-form-valid="isEditFormValid"
            :schema
            :edited-value="editedItem"
          />
          <slot name="prepend-actions" />
          <StyledEditFormDialogSaveButton
            :form-id
            :is-pending
            :is-savable="isSavable && (errorIcon?.isValid ?? true)"
          />
          <StyledEditFormDialogConfirmDeleteDialogButton :item-type :name :original-item :remove />
        </div>
      </Transition>
    </template>
    <!-- Held through the dialog's leave, so it rises out with what it showed rather than as an empty frame -->
    <Transition :duration="DIALOG_BODY_TRANSITION_DURATION">
      <div v-if="isOpen" contents>
        <div p-3 flex flex-1 flex-col gap-4 min-h-0 of-y-auto>
          <slot name="prepend-form" />
          <UiForm :id="formId" v-model:is-valid="isEditFormValid" @submit="answer(save)">
            <slot />
          </UiForm>
        </div>
        <StyledEditFormDialogConfirmCloseDialog
          v-model="isConfirmCloseDialogOpen"
          :is-savable
          :item-type
          @discard="isOpen = false"
          @save="answer(save)"
        />
      </div>
    </Transition>
  </UiDialog>
</template>
