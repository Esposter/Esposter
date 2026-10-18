<script setup lang="ts">
import { prettify } from "@/util/text/prettify";

interface Props {
  isSavable: boolean;
  itemType: string;
}

const isOpen = defineModel<boolean>({ required: true });
const { isSavable, itemType } = defineProps<Props>();
const emit = defineEmits<{ discard: []; save: [] }>();
</script>

<template>
  <!-- The close the title bar asks for while there are unsaved changes, answered with a save, a discard or a cancel -->
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
            emit('discard');
          }
        "
      >
        Discard changes
      </UiButton>
    </template>
  </StyledDialog>
</template>
