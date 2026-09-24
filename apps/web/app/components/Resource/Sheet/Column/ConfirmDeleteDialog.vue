<script setup lang="ts">
import { getDeleteColumnDescription } from "@/services/resource/sheet/commands/getDeleteColumnDescription";
import { useColumnDialogStore } from "@/store/resource/sheet/columnDialog";
import { withFinalizerAsync } from "@esposter/shared";

const columnDialogStore = useColumnDialogStore();
const { deletingColumnName } = storeToRefs(columnDialogStore);
const deleteColumn = useDeleteColumn();
const { isOpen } = useSingletonDialog(deletingColumnName);
const title = computed(() => getDeleteColumnDescription(deletingColumnName.value));
</script>

<template>
  <UiConfirmDialog
    v-model="isOpen"
    confirm-label="Delete"
    :title
    @confirm="
      async (onComplete) => {
        if (!deletingColumnName) return;
        await withFinalizerAsync(() => deleteColumn(deletingColumnName), onComplete);
      }
    "
  >
    <p>Delete this column and its values in every row? Undo brings it back.</p>
  </UiConfirmDialog>
</template>
