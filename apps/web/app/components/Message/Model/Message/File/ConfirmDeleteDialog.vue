<script setup lang="ts">
import { useDataStore } from "@/store/message/data";
import { useFileDialogStore } from "@/store/message/file/dialog";

const dataStore = useDataStore();
const { deleteFile, getSlice } = dataStore;
const fileDialogStore = useFileDialogStore();
const { deletingFileId, deletingMessageId, deletingRoomId } = storeToRefs(fileDialogStore);
const { isOpen, item: file } = useSingletonDialog(deletingFileId, () =>
  getSlice(deletingRoomId.value)
    .items.value.find(({ id }) => String(id) === deletingMessageId.value)
    ?.files.find(({ id }) => id === deletingFileId.value),
);
</script>

<template>
  <UiConfirmDialog
    v-if="file"
    v-model="isOpen"
    confirm-label="Remove"
    title="Remove attachment"
    :confirm="
      () =>
        file &&
        deletingMessageId &&
        deleteFile({ fileId: file.id, id: Number(deletingMessageId), roomId: deletingRoomId })
    "
    is-optimistic
  >
    <p>Are you sure you want to remove {{ file.filename }}? This cannot be undone.</p>
  </UiConfirmDialog>
</template>
