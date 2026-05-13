<script setup lang="ts">
import { useCallStore } from "@/store/message/room/call";

const callStore = useCallStore();
const { isDeafened } = storeToRefs(callStore);
const { toggleDeafen } = callStore;
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
