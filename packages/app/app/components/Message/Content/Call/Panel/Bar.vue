<script setup lang="ts">
import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

import { useCallStore } from "@/store/message/room/call";
import { useParticipantStore } from "@/store/message/room/call/participant";

const callStore = useCallStore();
const { currentRoomCallSessionId, isCallViewOpen } = storeToRefs(callStore);
const participantStore = useParticipantStore();
const { callSessionParticipantsMap, speakingIds } = storeToRefs(participantStore);
const roomParticipantMap = computed(
  () => callSessionParticipantsMap.value.get(currentRoomCallSessionId.value) ?? new Map<string, CallParticipant>(),
);
</script>

<template>
  <div px-4 py-2 bg-surface flex gap-x-3 items-center>
    <v-icon icon="mdi-volume-high" size="small" color="success" />
    <span font-medium flex-1 text-body-small>Call</span>
    <div flex gap-x-2 items-center>
      <MessageContentCallParticipantBarAvatar
        v-for="participant of roomParticipantMap.values()"
        :key="participant.id"
        :participant
        :is-hand-raised="participant.isHandRaised"
        :is-speaking="speakingIds.includes(participant.id)"
      />
    </div>
    <MessageContentCallAudioControlGroup />
    <MessageContentCallVideoControlGroup />
    <MessageContentCallAudioDeafenButton />
    <MessageContentCallScreenShareButton />
    <MessageContentCallControlHandButton />
    <MessageContentCallControlHealthButton />
    <MessageContentCallControlLeaveButton />
    <v-tooltip location="bottom" text="Open call view">
      <template #activator="{ props }">
        <v-btn
          :="props"
          icon="mdi-fullscreen"
          size="x-small"
          variant="text"
          :ripple="false"
          @click="isCallViewOpen = true"
        />
      </template>
    </v-tooltip>
  </div>
</template>
