<script setup lang="ts">
import { authClient } from "@/services/auth/authClient";
import { useCallStore } from "@/store/message/room/call";

const callStore = useCallStore();
const { callParticipants, isDeafened, speakingIds } = storeToRefs(callStore);
const { data: session } = await authClient.useSession(useFetch);
const sessionId = computed(() => session.value?.session.id);
</script>

<template>
  <div bg-black flex flex-col h-full w-full relative>
    <div p-4 pb-24 flex-1 gap-3 grid content-center style="grid-template-columns: repeat(auto-fit, minmax(240px, 1fr))">
      <CallParticipantTile
        v-for="participant of callParticipants"
        :key="participant.id"
        :participant
        :is-self="participant.id === sessionId"
        :is-speaking="speakingIds.includes(participant.id)"
        :is-deafened="isDeafened && participant.id === sessionId"
      />
    </div>
    <div bottom-0 left-0 right-0 absolute>
      <CallControlBar />
    </div>
  </div>
</template>
