<script setup lang="ts">
import { useCallStore } from "@/store/message/room/call";
import { useMediaStore } from "@/store/message/room/call/media";

const callStore = useCallStore();
const { toggleDeafen } = callStore;
const mediaStore = useMediaStore();
const { isDeafened } = storeToRefs(mediaStore);
</script>

<template>
  <MessageContentCallActionButton
    :color="isDeafened ? 'error' : undefined"
    :icon="isDeafened ? 'mdi-headphones-off' : 'mdi-headphones'"
    :tooltip="isDeafened ? 'Undeafen' : 'Deafen'"
    variant="plain"
    @click="toggleDeafen()"
  />
</template>
