<script setup lang="ts">
import { useCallStore } from "@/store/message/room/call";

const callStore = useCallStore();
const { leaveCall } = callStore;
</script>

<template>
  <MessageContentCallControlActionButton
    color="error"
    icon="mdi-phone-hangup"
    tooltip="Leave Call"
    variant="tonal"
    @click="leaveCall()"
  />
</template>
