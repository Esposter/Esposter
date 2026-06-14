<script setup lang="ts">
import { useKnockerStore } from "@/store/message/room/call/knocker";
import { useParticipantStore } from "@/store/message/room/call/participant";

const knockerStore = useKnockerStore();
const { knockers } = storeToRefs(knockerStore);
const participantStore = useParticipantStore();
const { clearJoinNotice } = participantStore;
const { joinNoticeParticipant } = storeToRefs(participantStore);
</script>

<template>
  <StyledCard v-if="knockers.length > 0" px-4 py-3 max-w-sm right-4 top-4 absolute>
    <div flex flex-col gap-y-3>
      <span op-medium-emphasis text-body-small>Waiting to join</span>
      <MessageContentCallJoinNoticeKnockerItem v-for="knocker of knockers" :key="knocker.id" :knocker />
    </div>
  </StyledCard>
  <StyledCard v-else-if="joinNoticeParticipant" px-4 py-3 right-4 top-4 absolute>
    <div flex gap-x-3 items-center>
      <StyledAvatar :image="joinNoticeParticipant.image" :name="joinNoticeParticipant.name" />
      <span font-medium text-body-medium>{{ joinNoticeParticipant.name }} joined the call</span>
      <v-tooltip text="Close">
        <template #activator="{ props: tooltipProps }">
          <v-btn :="tooltipProps" icon="mdi-close" size="small" variant="plain" @click="clearJoinNotice()" />
        </template>
      </v-tooltip>
    </div>
  </StyledCard>
</template>
