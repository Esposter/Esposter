<script setup lang="ts">
import type { CallParticipant } from "#shared/models/room/call/CallParticipant";
import type { CallParticipantTileProps } from "@/components/Message/Content/Call/Participant/Tile.vue";

import { authClient } from "@/services/auth/authClient";
import { useCallStore } from "@/store/message/room/call";
import { useMediaStore } from "@/store/message/room/call/media";
import { useParticipantStore } from "@/store/message/room/call/participant";

const callStore = useCallStore();
const { activeCallSessionId } = storeToRefs(callStore);
const mediaStore = useMediaStore();
const {
  activeScreenShareParticipantId,
  activeScreenShareStream,
  hasScreenShare,
  isDeafened,
  localVideoStream,
  pinnedParticipantId,
  remoteVideoStreams,
  screenSharingParticipantIds,
} = storeToRefs(mediaStore);
const participantStore = useParticipantStore();
const { callSessionParticipantsMap, speakingIds } = storeToRefs(participantStore);
const { data: session } = await authClient.useSession(useFetch);
const sessionId = computed(() => session.value?.session.id);
const callParticipantMap = computed(
  () => callSessionParticipantsMap.value.get(activeCallSessionId.value) ?? new Map<string, CallParticipant>(),
);
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
const getParticipantTileProps = (participant: CallParticipant): CallParticipantTileProps => ({
  isDeafened: isDeafened.value && participant.id === sessionId.value,
  isHandRaised: participant.isHandRaised,
  isScreenSharing: screenSharingParticipantIds.value.includes(participant.id),
  isSelf: participant.id === sessionId.value,
  isSpeaking: speakingIds.value.includes(participant.id),
  participant,
  videoStream:
    participant.id === sessionId.value
      ? (localVideoStream.value ?? undefined)
      : remoteVideoStreams.value.get(participant.id),
});
</script>

<template>
  <div bg-background flex flex-col size-full relative overflow-hidden>
    <main p-5 flex flex-1 gap-x-3 min-h-0 min-w-0 :class="isScreenSharePresenting ? 'flex-row' : 'flex-col'">
      <MessageContentCallScreenShareStage
        v-if="isScreenSharePresenting"
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
          h-32
          aspect-video
          shrink-0
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
