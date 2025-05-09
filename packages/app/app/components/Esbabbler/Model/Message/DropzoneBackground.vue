<script setup lang="ts">
import { AzureContainer } from "#shared/models/azure/blob/AzureContainer";
import { useMessageInputStore } from "@/store/esbabbler/messageInput";
import { useRoomStore } from "@/store/esbabbler/room";
import { BlockBlobClient } from "@azure/storage-blob";

const { $trpc } = useNuxtApp();
const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const messageInputStore = useMessageInputStore();
const { files } = storeToRefs(messageInputStore);
const { isOverDropZone } = useDropZone(document, async (newFiles) => {
  if (!currentRoomId.value || !newFiles) return;

  const sasUrls = await $trpc.message.generateUploadFileSasUrls.query({
    files: newFiles.map(({ name, type }) => ({ filename: name, mimetype: type })),
    roomId: currentRoomId.value,
  });
  await Promise.all(
    sasUrls.map((sasUrl, index) => {
      const file = newFiles[index];
      const blockBlobClient = new BlockBlobClient(
        sasUrl,
        AzureContainer.EsbabblerAssets,
        `${currentRoomId.value}/${file.name}`,
      );
      files.value.push({ filename: file.name, mimetype: file.type, url: blockBlobClient.url });
      return blockBlobClient.uploadData(file);
    }),
  );
});
</script>

<template>
  <v-overlay v-model="isOverDropZone" justify-center items-center text-xl>Drop files here</v-overlay>
</template>
