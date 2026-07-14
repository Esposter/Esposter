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
    :card-props="{ title }"
    @delete="
      (onComplete) => {
        if (!deletingColumnName) return;
        deleteColumn(deletingColumnName);
        onComplete();
      }
    "
  >
    Are you sure you want to delete this column?
  </StyledDeleteFormDialog>
</template>
