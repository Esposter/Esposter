<script setup lang="ts">
import { useMessageInputStore } from "@/store/esbabbler/messageInput";

const messageInputStore = useMessageInputStore();
const { files } = storeToRefs(messageInputStore);
</script>

<template>
  <v-container v-if="files.length > 0" pb-0 fluid>
    <v-row>
      <v-col v-for="file in files" :key="file.id" xl="2" lg="3" md="4" sm="6">
        <EsbabblerFileRenderer :file />
      </v-col>
    </v-row>
  </v-container>
</template>
