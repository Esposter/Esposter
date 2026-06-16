<script setup lang="ts">
import { useMediaStore } from "@/store/message/room/call/media";

const mediaStore = useMediaStore();
const { isPoppedOut } = storeToRefs(mediaStore);
const callView = useTemplateRef("callView");
</script>

<template>
  <div ref="callView" bg-background flex flex-col size-full relative overflow-hidden>
    <MessageContentCallPipPlaceholder v-if="isPoppedOut" />
    <template v-else>
      <MessageContentCallStage @fullscreen="callView?.requestFullscreen()" />
      <MessageContentCallInviteCard />
      <MessageContentCallJoinNotice />
    </template>
    <MessageContentCallControlBar />
  </div>
</template>
