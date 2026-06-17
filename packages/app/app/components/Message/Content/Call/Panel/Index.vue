<script setup lang="ts">
import { useCallStore } from "@/store/message/room/call";

const callStore = useCallStore();
const { isInCall } = storeToRefs(callStore);
</script>

<template>
  <div>
    <template v-if="isInCall">
      <MessageContentCallPanelBar />
      <v-divider />
    </template>
    <MessageContentCallPanelDialog />
  </div>
</template>
