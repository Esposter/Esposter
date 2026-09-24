<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useMediaStore } from "@/store/message/room/call/media";

defineSlots<{ append?: () => VNode }>();
const mediaStore = useMediaStore();
const { hasScreenShare, isPoppedOut } = storeToRefs(mediaStore);
const { presenterName } = useCallParticipantTiles();
const callView = useTemplateRef("callView");
</script>

<template>
  <div ref="callView" bg-background flex flex-col size-full relative of-hidden ui-body>
    <header v-if="hasScreenShare || $slots.append" p-3 flex gap-2 max-w-full items-center right-0 top-0 absolute z-1>
      <div v-if="hasScreenShare" pl-3 pr-1 flex gap-2 h-10 min-w-0 items-center ui-lifted ui-pill>
        <UiIcon :meaning="UiIconMeaning.ScreenShare" text-accent />
        <span truncate>{{ presenterName }} is presenting</span>
        <MessageContentCallScreenShareStopButton />
      </div>
      <slot name="append" />
    </header>
    <MessageContentCallPictureInPicturePlaceholder v-if="isPoppedOut" />
    <template v-else>
      <MessageContentCallStage @fullscreen="callView?.requestFullscreen()" />
      <MessageContentCallInviteCard />
      <MessageContentCallJoinNotice />
    </template>
    <MessageContentCallControlBar />
  </div>
</template>
