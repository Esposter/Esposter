<script setup lang="ts">
interface DeleteDialogButtonProps {
  index: number;
}

const { index } = defineProps<DeleteDialogButtonProps>();
const { deleteRow } = useEditedItemDataSourceOperations();
</script>

<template>
  <StyledConfirmDeleteDialogButton
    :card-props="{
      title: 'Delete Row',
      text: 'Are you sure you want to delete this row?',
    }"
    @delete="
      async (onComplete) => {
        deleteRow(index);
        onComplete();
      }
    "
  />
</template>
