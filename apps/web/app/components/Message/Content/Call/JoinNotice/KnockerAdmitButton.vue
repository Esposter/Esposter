<script setup lang="ts">
import type { CallParticipant } from "@esposter/db-schema";

import { useCallStore } from "#src/store/message/room/call/index";
import { useKnockerStore } from "#src/store/message/room/call/knocker";
import { withFinalizerAsync } from "@esposter/shared";

interface Props {
  knocker: CallParticipant;
}

defineProps<Props>();
const callStore = useCallStore();
const { activeCallSessionId } = storeToRefs(callStore);
const knockerStore = useKnockerStore();
const { admitKnocker } = knockerStore;
const isPending = ref(false);
</script>

<template>
  <!-- The server decides the admission, so the button is pending until it answers, and clears whichever way it ends so a
    Failed admit does not leave its spinner running -->
  <UiButton
    :is-pending
    @click="
      async () => {
        const callSessionId = activeCallSessionId;
        if (!callSessionId) return;
        isPending = true;
        await withFinalizerAsync(
          () => admitKnocker(callSessionId, knocker.id),
          () => {
            isPending = false;
          },
        );
      }
    "
  >
    Let in
  </UiButton>
</template>
