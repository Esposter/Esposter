<script setup lang="ts">
import { useMessageInputStore } from "@/store/esbabbler/messageInput";
import { useRoomStore } from "@/store/esbabbler/room";

const { $trpc } = useNuxtApp();
const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const messageInputStore = useMessageInputStore();
const { files } = storeToRefs(messageInputStore);
const urls = computedAsync(async () => {
  if (!currentRoomId.value || files.value.length === 0) return [];
  // @TODO: Optimise this to only run for new files
  return $trpc.message.generateDownloadFileSasUrls.query({
    files: files.value.map(({ filename, id, mimetype }) => ({ filename, id, mimetype })),
    roomId: currentRoomId.value,
  });
}, []);
</script>

<template>
  <v-container v-if="files.length > 0" pb-0 fluid>
    <v-row>
      <v-col v-for="(file, index) in files" :key="file.id" xl="2" lg="3" md="4" sm="6">
        <EsbabblerFileRenderer :file :url="urls[index]" />
      </v-col>
    </v-row>
  </v-container>
</template>
