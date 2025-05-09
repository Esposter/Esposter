<script setup lang="ts">
import { useMessageInputStore } from "@/store/esbabbler/messageInput";

const messageInputStore = useMessageInputStore();
const { files } = storeToRefs(messageInputStore);
const { isOverDropZone } = useDropZone(document, (newFiles) => {
  if (!newFiles) return;

  for (const newFile of newFiles) files.value.push({ filename: newFile.name, mimetype: newFile.type, url: "" });
});
</script>

<template>
  <v-overlay v-model="isOverDropZone" justify-center items-center text-xl>Drop files here</v-overlay>
</template>
