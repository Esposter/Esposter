<script setup lang="ts">
import { getDeleteRowDescription } from "@/services/resource/sheet/commands/getDeleteRowDescription";
import { useRowStore } from "@/store/resource/sheet/row";
import { useRowDialogStore } from "@/store/resource/sheet/rowDialog";
import { withFinalizerAsync } from "@esposter/shared";

const rowDialogStore = useRowDialogStore();
const { deletingId } = storeToRefs(rowDialogStore);
const rowStore = useRowStore();
const { rowIndexIdMap } = storeToRefs(rowStore);
const deleteRow = useDeleteRow();
const { isOpen } = useSingletonDialog(deletingId);
const cardProps = computed(() => {
  const index = deletingId.value ? (rowIndexIdMap.value.get(deletingId.value) ?? -1) : -1;
  return { title: getDeleteRowDescription(index) };
});
</script>

<template>
  <StyledDeleteFormDialog
    v-model="isOpen"
    :card-props
    @delete="
      async (onComplete) => {
        if (!deletingId) return;
        await withFinalizerAsync(() => deleteRow(deletingId), onComplete);
      }
    "
  >
    Are you sure you want to delete this row?
  </StyledDeleteFormDialog>
</template>
