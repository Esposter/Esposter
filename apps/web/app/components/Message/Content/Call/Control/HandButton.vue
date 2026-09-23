<script setup lang="ts">
import { useCallStore } from "@/store/message/room/call";

const callStore = useCallStore();
const { isHandRaised } = storeToRefs(callStore);
const { toggleHandRaised } = callStore;
</script>

<template>
  <MessageContentCallControlActionButton
    :color="isHandRaised ? 'warning' : undefined"
    :icon="isHandRaised ? 'i-mdi:hand-back-right' : 'i-mdi:hand-back-right-outline'"
    :tooltip="isHandRaised ? 'Lower Hand' : 'Raise Hand'"
    variant="plain"
    @click="toggleHandRaised()"
  />
</template>
