<script setup lang="ts">
import { useCallStore } from "#src/store/message/room/call/index";
import { useMediaStore } from "#src/store/message/room/call/media";

const callStore = useCallStore();
const { toggleScreenShare } = callStore;
const mediaStore = useMediaStore();
const { isScreenSharing } = storeToRefs(mediaStore);
</script>

<template>
  <UiButton v-if="isScreenSharing" @click="toggleScreenShare()">Stop presenting</UiButton>
</template>
