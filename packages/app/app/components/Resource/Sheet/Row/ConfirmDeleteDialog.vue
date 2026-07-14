<script setup lang="ts">
import { useRowStore } from "@/store/resource/sheet/row";
import { useRowDialogStore } from "@/store/resource/sheet/rowDialog";

const rowDialogStore = useRowDialogStore();
const { deletingId } = storeToRefs(rowDialogStore);
const rowStore = useRowStore();
const { rowIndexIdMap } = storeToRefs(rowStore);
const deleteRow = useDeleteRow();
const index = computed(() => (deletingId.value ? (rowIndexIdMap.value.get(deletingId.value) ?? -1) : -1));
const title = computed(() => `Delete Row ${index.value + 1}`);
const isOpen = useSingletonDialog(deletingId);
</script>

<template>
  <StyledDeleteFormDialog
    v-model="isOpen"
    :card-props="{ title }"
    @delete="
      (onComplete) => {
        if (!deletingId) return;
        deleteRow(deletingId);
        onComplete();
      }
    "
  >
    Are you sure you want to delete this row?
  </StyledDeleteFormDialog>
</template>
