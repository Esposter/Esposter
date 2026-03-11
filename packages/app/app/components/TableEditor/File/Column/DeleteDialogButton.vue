<script setup lang="ts">
interface DeleteDialogButtonProps {
  name: string;
}

const { name } = defineProps<DeleteDialogButtonProps>();
const { deleteColumn } = useEditedItemDataSource();
</script>

<template>
  <StyledConfirmDeleteDialogButton
    :card-props="{
      title: `Delete ${name} Column`,
      text: 'Are you sure you want to delete this column?',
    }"
    @delete="
      (onComplete) => {
        deleteColumn(name);
        onComplete();
      }
    "
  />
</template>
