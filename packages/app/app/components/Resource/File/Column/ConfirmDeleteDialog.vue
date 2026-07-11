<script setup lang="ts">
import { useColumnDialogStore } from "@/store/resource/file/columnDialog";

const columnDialogStore = useColumnDialogStore();
const { deletingColumnName } = storeToRefs(columnDialogStore);
const deleteColumn = useDeleteColumn();
const title = computed(() => `Delete "${deletingColumnName.value}" Column`);
const isOpen = useSingletonDialog(deletingColumnName);
</script>

<template>
  <StyledDeleteFormDialog
    v-model="isOpen"
    :card-props="{
      title,
      text: 'Are you sure you want to delete this column?',
    }"
    @delete="
      (onComplete) => {
        if (!deletingColumnName) return;
        deleteColumn(deletingColumnName);
        onComplete();
      }
    "
  />
</template>
