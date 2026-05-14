<script setup lang="ts">
import { authClient } from "@/services/auth/authClient";
import { useCallStore } from "@/store/message/room/call";
import { useCallMediaStore } from "@/store/message/room/call/media";
import { useCallParticipantStore } from "@/store/message/room/call/participant";

const callStore = useCallStore();
const { activeCallSessionId } = storeToRefs(callStore);
const mediaStore = useCallMediaStore();
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
const participantStore = useCallParticipantStore();
const { getParticipants } = participantStore;
const { speakingIds } = storeToRefs(participantStore);
const { data: session } = await authClient.useSession(useFetch);
const sessionId = computed(() => session.value?.session.id);
const callParticipants = computed(() => getParticipants(activeCallSessionId.value));
const activeScreenShareParticipant = computed(() =>
  callParticipants.value.find(({ id }) => id === activeScreenShareParticipantId.value),
);
const presenterName = computed(() => {
  const participant = activeScreenShareParticipant.value;
  if (!participant) return "Someone";
  return participant.id === sessionId.value ? `${participant.name} (You)` : participant.name;
});
const getParticipantTileProps = (participant: (typeof callParticipants.value)[number]) => ({
  participant,
  isSelf: participant.id === sessionId.value,
  isScreenSharing: screenSharingParticipantIds.value.includes(participant.id),
  isSpeaking: speakingIds.value.includes(participant.id),
  isDeafened: isDeafened.value && participant.id === sessionId.value,
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
        v-for="participant of callParticipants"
        :key="participant.id"
        :="getParticipantTileProps(participant)"
        @click="pinnedParticipantId = participant.id"
      />
    </div>
    <div v-if="hasScreenShare" px-3 pt-3 shrink-0 grid grid-cols="[repeat(auto-fill,minmax(14rem,1fr))]" gap-3>
      <MessageContentCallParticipantTile
        v-for="participant of callParticipants"
        :key="participant.id"
        h-32
        :="getParticipantTileProps(participant)"
        @click="pinnedParticipantId = participant.id"
      />
    </div>
    <MessageContentCallInviteCard />
    <MessageContentCallJoinNotice />
    <div bottom-0 left-0 right-0 absolute>
      <MessageContentCallControlBar />
    </div>
  </div>
</template>
