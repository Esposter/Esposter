<script setup lang="ts">
import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { useCallStore } from "#src/store/message/room/call/index";

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
