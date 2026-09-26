<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useCallStore } from "@/store/message/room/call";
import { useParticipantStore } from "@/store/message/room/call/participant";

const callStore = useCallStore();
const { isCallViewOpen } = storeToRefs(callStore);
const participantStore = useParticipantStore();
const { speakingIds } = storeToRefs(participantStore);
const roomParticipantMap = useCallRoomParticipantMap();
</script>

<!-- The call the reader is in, as a strip over the room's messages: who is in it, then its controls. A narrow screen keeps
     leaving and the call view, where every other control is -->
<template>
  <div px-3 py-1 flex gap-2 ui-bar items-center>
    <UiIcon :meaning="UiIconMeaning.Speaker" text-success />
    <span text-sm text-success shrink-0>In call</span>
    <div py-1 flex flex-1 gap-2 min-w-0 items-center of-x-auto>
      <MessageContentCallParticipantBarAvatar
        v-for="participant of roomParticipantMap.values()"
        :key="participant.id"
        :participant
        :is-speaking="speakingIds.includes(participant.id)"
      />
    </div>
    <div class="hidden md:flex" gap-2 items-center>
      <MessageContentCallControlGroup />
    </div>
    <MessageContentCallControlLeaveButton />
    <UiIconButton label="Open call view" :meaning="UiIconMeaning.Expand" @click="isCallViewOpen = true" />
  </div>
</template>
