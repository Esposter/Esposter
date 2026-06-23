<script setup lang="ts">
import { useMediaStore } from "@/store/message/room/call/media";

defineSlots<{ append?: () => VNode }>();
const mediaStore = useMediaStore();
const { hasScreenShare, isPoppedOut } = storeToRefs(mediaStore);
const { presenterName } = useCallParticipantTiles();
const callView = useTemplateRef("callView");
</script>

<template>
  <div ref="callView" bg-background flex flex-col size-full relative overflow-hidden>
    <header v-if="hasScreenShare || $slots.append" pa-3 flex gap-x-3 items-center right-0 top-0 absolute z-1>
      <StyledCard v-if="hasScreenShare" rounded="pill" px-4 py-2 flex gap-x-3 items-center>
        <v-icon icon="mdi-monitor-share" text-primary />
        <span font-medium truncate>{{ presenterName }} is presenting</span>
        <MessageContentCallScreenShareStopButton />
      </StyledCard>
      <slot name="append" />
    </header>
    <MessageContentCallPipPlaceholder v-if="isPoppedOut" />
    <template v-else>
      <MessageContentCallStage @fullscreen="callView?.requestFullscreen()" />
      <MessageContentCallInviteCard />
      <MessageContentCallJoinNotice />
    </template>
    <MessageContentCallControlBar />
  </div>
</template>
