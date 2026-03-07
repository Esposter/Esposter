<script setup lang="ts">
import { useFileTableEditorStore } from "@/store/tableEditor/file";

interface DeleteDialogButtonProps {
  index: number;
}

const { index } = defineProps<DeleteDialogButtonProps>();
const fileTableEditorStore = useFileTableEditorStore();
const { deleteRow } = fileTableEditorStore;
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
