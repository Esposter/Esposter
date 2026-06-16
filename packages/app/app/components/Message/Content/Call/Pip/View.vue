<script setup lang="ts">
import { useMediaStore } from "@/store/message/room/call/media";

const mediaStore = useMediaStore();
const { hasScreenShare } = storeToRefs(mediaStore);
const { presenterName } = useCallParticipantTiles();
</script>

<template>
  <div bg-background flex flex-col size-full overflow-hidden>
    <div v-if="hasScreenShare" px-3 py-1 flex shrink-0 gap-x-2 items-center>
      <v-icon icon="mdi-monitor-share" size="small" text-primary />
      <span font-medium truncate text-body-small>{{ presenterName }} is presenting</span>
    </div>
    <MessageContentCallStage is-dense />
    <MessageContentCallPipControlBar />
  </div>
</template>
