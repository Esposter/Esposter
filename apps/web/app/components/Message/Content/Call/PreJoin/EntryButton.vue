<script setup lang="ts">
import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { useCallStore } from "#src/store/message/room/call/index";
import { useKnockerStore } from "#src/store/message/room/call/knocker";
import { withFinalizerAsync } from "@esposter/shared";

interface Props {
  callId: string;
  isCreator: boolean;
}

defineProps<Props>();
const callStore = useCallStore();
const { joinCall } = callStore;
const knockerStore = useKnockerStore();
const { knockCall } = knockerStore;
const isRequestingJoin = ref(false);
</script>

<template>
  <UiButton
    :is-pending="isRequestingJoin"
    :variant="UiButtonVariant.Accent"
    @click="
      async () => {
        isRequestingJoin = true;
        await withFinalizerAsync(
          async () => {
            if (isCreator) await joinCall(callId);
            else await knockCall(callId);
          },
          () => {
            isRequestingJoin = false;
          },
        );
      }
    "
  >
    {{ isCreator ? "Join now" : "Request to join" }}
  </UiButton>
</template>
