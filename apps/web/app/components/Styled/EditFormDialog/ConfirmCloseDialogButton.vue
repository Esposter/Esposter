<script setup lang="ts" generic="T extends ItemEntityType<string>">
import type { ItemEntityType } from "@esposter/shared";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { prettify } from "@/util/text/prettify";

interface Props<T> {
  editedItem: T;
  isDirty: boolean;
  isSavable: boolean;
}

const dialog = defineModel<boolean>({ required: true });
const { editedItem, isDirty, isSavable } = defineProps<Props<T>>();
const emit = defineEmits<{ save: []; "update:is-edit-form-dialog-open": [value: false] }>();
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
      <UiIconButton
        label="Close"
        :meaning="UiIconMeaning.Close"
        :variant="UiButtonVariant.Quiet"
        @click="
          () => {
            if (isDirty) dialog = true;
            else emit('update:is-edit-form-dialog-open', false);
          }
        "
      />
    </template>
    You have modified this {{ displayItemType }}. You can save your changes, discard your changes, or cancel to continue
    editing.
    <template #prepend-confirm>
      <UiButton
        @click="
          () => {
            dialog = false;
            emit('update:is-edit-form-dialog-open', false);
          }
        "
      >
        Discard changes
      </UiButton>
    </template>
  </StyledDialog>
</template>
