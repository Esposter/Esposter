<script setup lang="ts">
import { useMessageInputStore } from "@/store/esbabbler/messageInput";

const messageInputStore = useMessageInputStore();
const { removeFileUrl } = messageInputStore;
const { files, uploadFileUrlMap } = storeToRefs(messageInputStore);
</script>

<template>
  <v-container v-if="files.length > 0" pb-0 fluid>
    <v-row m-0 flex-nowrap overflow-x-auto>
      <EsbabblerModelMessageFileInput
        v-for="(file, index) in files"
        :key="file.id"
        :file
        :index
        :upload-file-url="uploadFileUrlMap.get(file.id)!"
        @delete="
          (index) => {
            const { id } = files.splice(index, 1)[0];
            removeFileUrl(id);
          }
        "
      />
    </v-row>
  </v-container>
</template>
