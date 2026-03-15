<script setup lang="ts">
interface DeleteDialogButtonProps {
  id: string;
  index: number;
}

const { id, index } = defineProps<DeleteDialogButtonProps>();
const { deleteRow } = useEditedItemDataSourceOperations();
</script>

<template>
  <StyledConfirmDeleteDialogButton
    :card-props="{
      title: `Delete Row ${index + 1}`,
      text: 'Are you sure you want to delete this row?',
    }"
    @delete="
      (onComplete) => {
        deleteRow(id);
        onComplete();
      }
    "
  />
</template>
