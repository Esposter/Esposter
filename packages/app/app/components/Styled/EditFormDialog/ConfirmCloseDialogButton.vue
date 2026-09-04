<script setup lang="ts" generic="T extends ItemEntityType<string>">
import type { ItemEntityType } from "@esposter/shared";

import { prettify } from "@/util/text/prettify";

interface StyledEditFormDialogConfirmCloseDialogButtonProps<T> {
  editedItem: T;
  isDirty: boolean;
  isSavable: boolean;
}

const dialog = defineModel<boolean>({ required: true });
const { editedItem, isDirty, isSavable } = defineProps<StyledEditFormDialogConfirmCloseDialogButtonProps<T>>();
const emit = defineEmits<{ save: []; "update:edit-form-dialog": [value: false] }>();
const confirmButtonProps = computed(() => ({ disabled: !isSavable, text: "Save changes" }));
const displayItemType = computed(() => prettify(editedItem.type));
</script>

<template>
  <StyledDialog
    v-model="dialog"
    :card-props="{ title: 'Confirm Changes' }"
    :confirm-button-props
    @confirm="
      (onComplete) => {
        onComplete();
        emit('save');
      }
    "
  >
    <template #activator>
      <StyledTooltipIconButton
        icon="mdi-close"
        text="Close"
        @click="
          () => {
            if (isDirty) dialog = true;
            else emit('update:edit-form-dialog', false);
          }
        "
      />
    </template>
    You have modified this {{ displayItemType }}. You can save your changes, discard your changes, or cancel to continue
    editing.
    <template #prepend-confirm>
      <v-btn
        text="Discard changes"
        variant="outlined"
        @click="
          () => {
            dialog = false;
            emit('update:edit-form-dialog', false);
          }
        "
      />
    </template>
  </StyledDialog>
</template>
