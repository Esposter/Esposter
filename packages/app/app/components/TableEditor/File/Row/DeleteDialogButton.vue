<script setup lang="ts">
interface DeleteDialogButtonProps {
  id: string;
}

const { id } = defineProps<DeleteDialogButtonProps>();
const { deleteRow } = useEditedItemDataSourceOperations();
</script>

<template>
  <StyledConfirmDeleteDialogButton
    :card-props="{
      title: 'Delete Row',
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
