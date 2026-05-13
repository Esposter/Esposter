<script setup lang="ts">
import { authClient } from "@/services/auth/authClient";
import { useCallStore } from "@/store/message/room/call";

const callStore = useCallStore();
const { setPinnedParticipantId } = callStore;
const {
  activeScreenShareParticipant,
  activeScreenShareStream,
  callParticipants,
  hasScreenShare,
  isDeafened,
  localVideoStream,
  remoteVideoStreams,
  screenSharingParticipantIds,
  speakingIds,
} = storeToRefs(callStore);
const { data: session } = await authClient.useSession(useFetch);
const sessionId = computed(() => session.value?.session.id);
const presenterName = computed(() => {
  const participant = activeScreenShareParticipant.value;
  if (!participant) return "Someone";
  return participant.id === sessionId.value ? `${participant.name} (You)` : participant.name;
});
</script>

<template>
  <div bg-background flex flex-col size-full relative>
    <MessageContentCallScreenShareStage
      v-if="hasScreenShare && activeScreenShareStream"
      :presenter-name
      :stream="activeScreenShareStream"
    />
    <div
      v-else
      p-3
      pb-24
      flex-1
      gap-3
      grid
      content-center
      style="grid-template-columns: repeat(auto-fit, minmax(240px, 1fr))"
    >
      <MessageContentCallParticipantTile
        v-for="participant of callParticipants"
        :key="participant.id"
        :participant
        :is-self="participant.id === sessionId"
        :is-screen-sharing="screenSharingParticipantIds.includes(participant.id)"
        :is-speaking="speakingIds.includes(participant.id)"
        :is-deafened="isDeafened && participant.id === sessionId"
        :video-stream="
          participant.id === sessionId ? (localVideoStream ?? undefined) : remoteVideoStreams.get(participant.id)
        "
        @click="setPinnedParticipantId(participant.id)"
      />
    </div>
    <div v-if="hasScreenShare" px-3 pb-24 pt-3 flex gap-x-3 overflow-x-auto>
      <MessageContentCallParticipantTile
        v-for="participant of callParticipants"
        :key="participant.id"
        min-w-56
        :participant
        :is-self="participant.id === sessionId"
        :is-screen-sharing="screenSharingParticipantIds.includes(participant.id)"
        :is-speaking="speakingIds.includes(participant.id)"
        :is-deafened="isDeafened && participant.id === sessionId"
        :video-stream="
          participant.id === sessionId ? (localVideoStream ?? undefined) : remoteVideoStreams.get(participant.id)
        "
        @click="setPinnedParticipantId(participant.id)"
      />
    </div>
    <MessageContentCallInviteCard />
    <MessageContentCallJoinNotice />
    <div bottom-0 left-0 right-0 absolute>
      <MessageContentCallControlBar />
    </div>
  </div>
</template>
