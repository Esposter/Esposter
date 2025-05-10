<script setup lang="ts">
import type { ParsedFileEntity } from "@/models/esbabbler/file/ParsedFileEntity";

import { MAX_FILE_LIMIT } from "#shared/services/azure/container/constants";
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
  else if (files.value.length + newFiles.length > MAX_FILE_LIMIT) {
    useToast(`You can only upload ${MAX_FILE_LIMIT} files at a time!`, { cardProps: { color: "error" } });
    return;
  }

  const fileSasEntities = await $trpc.message.generateUploadFileSasUrls.query({
    files: newFiles.map(({ name, type }) => ({ filename: name, mimetype: type })),
    roomId: currentRoomId.value,
  });
  const downloadFileSasUrls = await $trpc.message.generateDownloadFileSasUrls.query({
    files: fileSasEntities.map(({ id }, index) => {
      const file = newFiles[index];
      return { filename: file.name, id, mimetype: file.type };
    }),
    roomId: currentRoomId.value,
  });
  const parsedFileEntities = newFiles.map<ParsedFileEntity>(({ name, type }, index) => ({
    filename: name,
    id: fileSasEntities[index].id,
    mimetype: type,
    url: downloadFileSasUrls[index],
  }));
  files.value.push(...parsedFileEntities);
  await Promise.all(newFiles.map((file, index) => uploadBlocks(file, fileSasEntities[index].sasUrl)));
});
</script>

<template>
  <v-overlay v-model="isOverDropZone" justify-center items-center text-xl>Drop files here</v-overlay>
</template>
