<script setup lang="ts">
import { getDeleteRowDescription } from "@/services/resource/sheet/commands/getDeleteRowDescription";
import { useRowStore } from "@/store/resource/sheet/row";
import { useRowDialogStore } from "@/store/resource/sheet/rowDialog";
import { withFinalizerAsync } from "@esposter/shared";

const rowDialogStore = useRowDialogStore();
const { deletingId } = storeToRefs(rowDialogStore);
const rowStore = useRowStore();
const { rowIdIndexMap } = storeToRefs(rowStore);
const deleteRow = useDeleteRow();
const { isOpen } = useSingletonDialog(deletingId);
const title = computed(() =>
  getDeleteRowDescription(deletingId.value ? (rowIdIndexMap.value.get(deletingId.value) ?? -1) : -1),
);
</script>

<template>
  <UiConfirmDialog
    v-model="isOpen"
    confirm-label="Delete"
    :title
    @confirm="
      async (onComplete) => {
        if (!deletingId) return;
        await withFinalizerAsync(() => deleteRow(deletingId), onComplete);
      }
    "
  >
    <p>Delete this row? Undo brings it back.</p>
  </UiConfirmDialog>
</template>
