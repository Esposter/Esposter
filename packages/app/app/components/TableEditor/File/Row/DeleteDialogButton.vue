<script setup lang="ts">
import { useFileTableEditorStore } from "@/store/tableEditor/file";

const { index } = defineProps<{ index: number }>();
const { deleteRow } = useFileTableEditorStore();
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
