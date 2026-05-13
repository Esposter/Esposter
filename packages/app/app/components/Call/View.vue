<script setup lang="ts">
import { authClient } from "@/services/auth/authClient";
import { useCallStore } from "@/store/message/room/call";

const callStore = useCallStore();
const { callParticipants, isDeafened, localVideoStream, remoteVideoStreams, speakingIds } = storeToRefs(callStore);
const { data: session } = await authClient.useSession(useFetch);
const sessionId = computed(() => session.value?.session.id);
</script>

<template>
  <div bg-background flex flex-col size-full relative>
    <div flex-1 gap-3 grid content-center style="grid-template-columns: repeat(auto-fit, minmax(240px, 1fr))">
      <CallParticipantTile
        v-for="participant of callParticipants"
        :key="participant.id"
        :participant
        :is-self="participant.id === sessionId"
        :is-speaking="speakingIds.includes(participant.id)"
        :is-deafened="isDeafened && participant.id === sessionId"
        :video-stream="
          participant.id === sessionId ? (localVideoStream ?? undefined) : remoteVideoStreams.get(participant.id)
        "
      />
    </div>
    <div bottom-0 left-0 right-0 absolute>
      <CallControlBar />
    </div>
  </div>
</template>
