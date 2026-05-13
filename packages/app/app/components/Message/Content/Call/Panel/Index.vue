<script setup lang="ts">
import { useCallStore } from "@/store/message/room/call";

const callStore = useCallStore();
const { isInCall } = storeToRefs(callStore);
</script>

<template>
  <div>
    <MessageContentCallPanelBar v-if="isInCall" />
    <MessageContentCallPanelDialog />
  </div>
</template>
