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
      title: `Delete ${name}`,
      text: 'Are you sure you want to delete this field?',
    }"
    @delete="
      (onComplete) => {
        deleteColumn(name);
        onComplete();
      }
    "
  />
</template>
