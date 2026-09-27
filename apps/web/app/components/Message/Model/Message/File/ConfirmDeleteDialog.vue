<script setup lang="ts">
import { useDataStore } from "@/store/message/data";
import { useFileDialogStore } from "@/store/message/file/dialog";

const dataStore = useDataStore();
const { deleteFile, getSlice } = dataStore;
const fileDialogStore = useFileDialogStore();
const { deletingFileId, deletingRoomId, deletingRowKey } = storeToRefs(fileDialogStore);
const { isOpen, item: file } = useSingletonDialog(deletingFileId, () =>
  getSlice(deletingRoomId.value)
    .items.value.find(({ rowKey }) => rowKey === deletingRowKey.value)
    ?.files.find(({ id }) => id === deletingFileId.value),
);
</script>

<template>
  <UiConfirmDialog
    v-if="file"
    v-model="isOpen"
    confirm-label="Remove"
    title="Remove attachment"
    :confirm="() => file && deleteFile({ id: file.id, partitionKey: deletingRoomId, rowKey: deletingRowKey })"
    is-optimistic
  >
    <p>Are you sure you want to remove {{ file.filename }}? This cannot be undone.</p>
  </UiConfirmDialog>
</template>
