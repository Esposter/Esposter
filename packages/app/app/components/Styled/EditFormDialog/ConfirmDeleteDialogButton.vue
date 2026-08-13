<script setup lang="ts" generic="T extends ItemEntityType<string>">
import type { ItemEntityType } from "@esposter/shared";

interface ConfirmDeleteDialogButtonProps<T> {
  name: string;
  originalItem?: T;
}

const { name, originalItem } = defineProps<ConfirmDeleteDialogButtonProps<T>>();
const emit = defineEmits<{ delete: [onComplete: (isSuccessful?: boolean) => void] }>();
</script>

<template>
  <StyledDeleteFormDialog
    v-if="originalItem"
    :card-props="{ title: `Confirm Deletion of ${originalItem.type}` }"
    :confirm-name="name"
    @delete="emit('delete', $event)"
  >
    <template #activator="{ updateIsOpen }">
      <StyledTooltipIconButton icon="mdi-delete" text="Delete" @click="updateIsOpen(true)" />
    </template>
    <div>
      To confirm the delete action please enter the name of the
      <span font-bold>{{ originalItem.type }}</span> exactly as it occurs.
    </div>
  </StyledDeleteFormDialog>
</template>
