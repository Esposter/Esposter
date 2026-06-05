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
  <div bg-background flex flex-col size-full relative>
    <MessageContentCallScreenShareStage
      v-if="hasScreenShare && activeScreenShareStream"
      :presenter-name
      :stream="activeScreenShareStream"
    />
    <div v-else p-3 flex-1 gap-3 grid grid-auto-rows-fr grid-cols="[repeat(auto-fit,minmax(240px,1fr))]">
      <MessageContentCallParticipantTile
        v-for="participant of callParticipantMap.values()"
        :key="participant.id"
        :="getParticipantTileProps(participant)"
        @click="pinnedParticipantId = participant.id"
      />
    </div>
    <div v-if="hasScreenShare" grid-cols="[repeat(auto-fill,minmax(14rem,1fr))]" p-3 shrink-0 gap-3 grid>
      <MessageContentCallParticipantTile
        v-for="participant of callParticipantMap.values()"
        :key="participant.id"
        h-32
        :="getParticipantTileProps(participant)"
        @click="pinnedParticipantId = participant.id"
      />
    </div>
    <MessageContentCallInviteCard />
    <MessageContentCallJoinNotice />
    <MessageContentCallControlBar />
  </div>
</template>
