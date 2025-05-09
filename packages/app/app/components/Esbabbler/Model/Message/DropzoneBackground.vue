<script setup lang="ts">
import { uploadBlocks } from "@/services/esbabbler/uploadBlocks";
import { useMessageInputStore } from "@/store/esbabbler/messageInput";
import { useRoomStore } from "@/store/esbabbler/room";

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
      const url = new URL(sasUrl);
      files.value.push({ filename: file.name, mimetype: file.type, url: url.pathname });
      return uploadBlocks(file, sasUrl);
    }),
  );
});
</script>

<template>
  <v-overlay v-model="isOverDropZone" justify-center items-center text-xl>Drop files here</v-overlay>
</template>
