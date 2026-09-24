<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useCallStore } from "@/store/message/room/call";

const callStore = useCallStore();
const { leaveCall } = callStore;
</script>

<template>
  <MessageContentCallControlActionButton
    :meaning="UiIconMeaning.HangUp"
    label="Leave Call"
    :variant="UiButtonVariant.Danger"
    @click="leaveCall()"
  />
</template>
