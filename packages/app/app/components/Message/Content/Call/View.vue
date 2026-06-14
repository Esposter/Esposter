<script setup lang="ts">
import { useMediaStore } from "@/store/message/room/call/media";

const mediaStore = useMediaStore();
const { activeScreenShareParticipantId, activeScreenShareStream, hasScreenShare, pinnedParticipantId } =
  storeToRefs(mediaStore);
const { callParticipantMap, getParticipantTileProps, sessionId } = useCallParticipantTiles();
const activeScreenShareParticipant = computed(() =>
  activeScreenShareParticipantId.value ? callParticipantMap.value.get(activeScreenShareParticipantId.value) : undefined,
);
const presenterName = computed(() => {
  const participant = activeScreenShareParticipant.value;
  if (!participant) return "Someone";
  return participant.id === sessionId.value ? `${participant.name} (You)` : participant.name;
});
const isScreenSharePresenting = computed(() => hasScreenShare.value && Boolean(activeScreenShareStream.value));
const callParticipantGridClass = computed(() => {
  if (callParticipantMap.value.size <= 1) return "grid-cols-1";
  if (callParticipantMap.value.size === 2) return "grid-cols-1 md:grid-cols-2";
  return "grid-cols-1 md:grid-cols-2 xl:grid-cols-3";
});
</script>

<template>
  <div bg-background flex flex-col size-full relative overflow-hidden>
    <main p-5 flex flex-1 gap-x-3 min-h-0 min-w-0 :class="isScreenSharePresenting ? 'flex-row' : 'flex-col'">
      <MessageContentCallScreenShareStage
        v-if="hasScreenShare && activeScreenShareStream"
        :presenter-name
        :stream="activeScreenShareStream"
      />
      <div v-else flex-1 gap-3 grid grid-auto-rows-fr :class="callParticipantGridClass">
        <MessageContentCallParticipantTile
          v-for="participant of callParticipantMap.values()"
          :key="participant.id"
          :="getParticipantTileProps(participant)"
          @click="pinnedParticipantId = participant.id"
        />
      </div>
      <div v-if="isScreenSharePresenting" flex shrink-0 flex-col gap-y-3 items-center overflow-y-auto>
        <MessageContentCallParticipantTile
          v-for="participant of callParticipantMap.values()"
          :key="participant.id"
          shrink-0
          h-32
          aspect-video
          :="getParticipantTileProps(participant)"
          @click="pinnedParticipantId = participant.id"
        />
      </div>
    </main>
    <MessageContentCallInviteCard />
    <MessageContentCallJoinNotice />
    <MessageContentCallControlBar />
  </div>
</template>
