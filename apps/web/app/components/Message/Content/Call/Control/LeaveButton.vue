<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useCallStore } from "@/store/message/room/call";

const callStore = useCallStore();
const { isLeaving } = storeToRefs(callStore);
const { leaveCall } = callStore;
</script>

<template>
  <UiIconButton
    :is-pending="isLeaving"
    :meaning="UiIconMeaning.HangUp"
    label="Leave Call"
    :variant="UiButtonVariant.Danger"
    @click="leaveCall()"
  />
</template>
