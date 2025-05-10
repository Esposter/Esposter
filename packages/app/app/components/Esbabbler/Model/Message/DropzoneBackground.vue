<script setup lang="ts">
import { MAX_FILE_LIMIT } from "#shared/services/azure/container/constants";
import { uploadBlocks } from "@/services/esbabbler/uploadBlocks";
import { useMessageInputStore } from "@/store/esbabbler/messageInput";
import { useRoomStore } from "@/store/esbabbler/room";

const { $trpc } = useNuxtApp();
const roomStore = useRoomStore();
const { currentRoomId, currentRoomName } = storeToRefs(roomStore);
const messageInputStore = useMessageInputStore();
const { files } = storeToRefs(messageInputStore);
const { isOverDropZone } = useDropZone(document, async (newFiles) => {
  if (!currentRoomId.value || !newFiles) return;
  else if (files.value.length + newFiles.length > MAX_FILE_LIMIT) {
    useToast(`You can only upload ${MAX_FILE_LIMIT} files at a time!`, { cardProps: { color: "error" } });
    return;
  }

  const fileSasEntities = await $trpc.message.generateUploadFileSasUrls.query({
    files: newFiles.map(({ name, type }) => ({ filename: name, mimetype: type })),
    roomId: currentRoomId.value,
  });
  await Promise.all(
    newFiles.map(async (file, index) => {
      const { id, sasUrl } = fileSasEntities[index];
      files.value[index] = { filename: file.name, id, mimetype: file.type, url: URL.createObjectURL(file) };
      await uploadBlocks(file, sasUrl);
    }),
  );
});
</script>

<template>
  <v-dialog v-model="isOverDropZone" width="auto">
    <StyledCard p-8 text-center>
      <v-card-title pb-0 text-xl font-bold>Upload to {{ currentRoomName }}</v-card-title>
      <v-card-subtitle>You can add comments before uploading.</v-card-subtitle>
    </StyledCard>
  </v-dialog>
</template>
