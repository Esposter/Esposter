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
const callParticipantGridClass = computed(() => {
  if (callParticipantMap.value.size <= 1) return "grid-cols-1";
  if (callParticipantMap.value.size === 2) return "grid-cols-1 md:grid-cols-2";
  return "grid-cols-1 md:grid-cols-2 xl:grid-cols-3";
});
const screenShareParticipantGridClass = computed(() => {
  if (callParticipantMap.value.size <= 1) return "grid-cols-1";
  if (callParticipantMap.value.size === 2) return "grid-cols-2";
  return "grid-cols-2 md:grid-cols-3 xl:grid-cols-4";
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
    <div p-5 flex flex-1 flex-col gap-y-4 min-h-0>
      <main flex flex-1 flex-col min-h-0 min-w-0>
        <StyledCard flex flex-1 min-h-0 overflow-hidden>
          <MessageContentCallScreenShareStage
            v-if="hasScreenShare && activeScreenShareStream"
            :presenter-name
            :stream="activeScreenShareStream"
          />
          <div v-else p-3 flex-1 gap-3 grid grid-auto-rows-fr :class="callParticipantGridClass">
            <MessageContentCallParticipantTile
              v-for="participant of callParticipantMap.values()"
              :key="participant.id"
              :="getParticipantTileProps(participant)"
              @click="pinnedParticipantId = participant.id"
            />
          </div>
        </StyledCard>
        <div
          v-if="hasScreenShare && activeScreenShareStream"
          pt-3
          shrink-0
          gap-3
          grid
          :class="screenShareParticipantGridClass"
        >
          <MessageContentCallParticipantTile
            v-for="participant of callParticipantMap.values()"
            :key="participant.id"
            :="getParticipantTileProps(participant)"
            @click="pinnedParticipantId = participant.id"
          />
        </div>
      </main>
    </div>
    <MessageContentCallInviteCard />
    <MessageContentCallJoinNotice />
    <MessageContentCallControlBar />
  </div>
</template>
