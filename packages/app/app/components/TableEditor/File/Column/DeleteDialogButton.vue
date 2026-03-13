<script setup lang="ts">
interface DeleteDialogButtonProps {
  name: string;
}

const { name } = defineProps<DeleteDialogButtonProps>();
const { deleteColumn } = useEditedItemDataSourceOperations();
const title = computed(() => `Delete "${name}" Column`);
</script>

<template>
  <StyledConfirmDeleteDialogButton
    :card-props="{
      title,
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
