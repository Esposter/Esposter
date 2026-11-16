<script setup lang="ts">
import { prettify } from "#src/util/text/prettify";

interface Props {
  isSavable: boolean;
  itemType: string;
}

const isOpen = defineModel<boolean>({ required: true });
const { itemType } = defineProps<Props>();
const emit = defineEmits<{ discard: []; save: [] }>();
// Derived here rather than in the template, which re-renders on every open and close of the dialog
const itemLabel = computed(() => prettify(itemType));
</script>

<template>
  <!-- The close the title bar asks for while there are unsaved changes, answered with a save, a discard or a cancel -->
  <StyledDialog
    v-model="isOpen"
    confirm-label="Save changes"
    :is-confirm-disabled="!isSavable || undefined"
    title="Confirm Changes"
    :confirm="() => emit('save')"
  >
    You have modified this {{ itemLabel }}. You can save your changes, discard your changes, or cancel to continue
    editing.
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
