<script setup lang="ts">
import { useCallStore } from "@/store/message/room/call";

const callStore = useCallStore();
const { leaveCall } = callStore;
const onClick = async () => {
  await leaveCall();
};
</script>

<template>
  <MessageContentCallActionButton
    color="error"
    icon="mdi-phone-hangup"
    tooltip="Leave Call"
    variant="tonal"
    @click="onClick()"
  />
</template>
