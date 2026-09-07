<script setup lang="ts">
import { useCallStore } from "@/store/message/room/call";
import { useMediaStore } from "@/store/message/room/call/media";

const callStore = useCallStore();
const { toggleScreenShare } = callStore;
const mediaStore = useMediaStore();
const { isScreenSharing } = storeToRefs(mediaStore);
</script>

<template>
  <v-btn v-if="isScreenSharing" color="info" variant="tonal" rounded="pill" size="small" @click="toggleScreenShare()">
    Stop presenting
  </v-btn>
</template>
