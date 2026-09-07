<script setup lang="ts">
import { useCallStore } from "@/store/message/room/call";
import { useParticipantStore } from "@/store/message/room/call/participant";

const callStore = useCallStore();
const { isCallViewOpen } = storeToRefs(callStore);
const participantStore = useParticipantStore();
const { speakingIds } = storeToRefs(participantStore);
const roomParticipantMap = useCallRoomParticipantMap();
</script>

<template>
  <v-sheet px-4 py-2 flex gap-x-3 items-center>
    <v-icon icon="mdi-volume-high" size="small" color="success" />
    <span font-medium flex-1 text-body-small>Call</span>
    <div flex gap-x-2 items-center>
      <MessageContentCallParticipantBarAvatar
        v-for="participant of roomParticipantMap.values()"
        :key="participant.id"
        :participant
        :is-speaking="speakingIds.includes(participant.id)"
      />
    </div>
    <MessageContentCallControlGroup />
    <MessageContentCallControlLeaveButton />
    <StyledTooltipIconButton
      :button-props="{ ripple: false, size: 'x-small', variant: 'text' }"
      icon="mdi-fullscreen"
      text="Open call view"
      :tooltip-props="{ location: 'bottom' }"
      @click="isCallViewOpen = true"
    />
  </v-sheet>
</template>
