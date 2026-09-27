<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { prettify } from "@/util/text/prettify";

interface Props {
  isDirty: boolean;
  isSavable: boolean;
  itemType: string;
}

const isOpen = defineModel<boolean>({ required: true });
const { isDirty, isSavable, itemType } = defineProps<Props>();
const emit = defineEmits<{ save: []; "update:is-edit-form-dialog-open": [value: false] }>();
</script>

<template>
  <UiIconButton
    label="Close"
    :meaning="UiIconMeaning.Close"
    :variant="UiButtonVariant.Quiet"
    @click="
      () => {
        if (isDirty) isOpen = true;
        else emit('update:is-edit-form-dialog-open', false);
      }
    "
  />
  <StyledDialog
    v-model="isOpen"
    confirm-label="Save changes"
    :is-confirm-disabled="!isSavable || undefined"
    title="Confirm Changes"
    is-optimistic
    :confirm="() => emit('save')"
  >
    You have modified this {{ prettify(itemType) }}. You can save your changes, discard your changes, or cancel to
    continue editing.
    <template #prepend-confirm>
      <UiButton
        @click="
          () => {
            isOpen = false;
            emit('update:is-edit-form-dialog-open', false);
          }
        "
      >
        Discard changes
      </UiButton>
    </template>
  </StyledDialog>
</template>
