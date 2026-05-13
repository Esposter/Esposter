<script setup lang="ts">
import { useCallStore } from "@/store/message/room/call";

const callStore = useCallStore();
const { isInCall } = storeToRefs(callStore);
</script>

<template>
  <TransitionFade>
    <MessageContentCallPanelBar v-if="isInCall" />
  </TransitionFade>
  <MessageContentCallPanelDialog />
</template>
