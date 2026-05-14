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
  <StyledCard
    v-if="knockers.length > 0"
    left="[50%]"
    mt-4
    px-4
    py-3
    top-0
    absolute
    translate-x="[-50%]"
    max-w-xs
    w-full
  >
    <div flex flex-col gap-y-3>
      <span text-body-small text-medium-emphasis>Waiting to join</span>
      <MessageContentCallJoinNoticeKnockerItem v-for="knocker of knockers" :key="knocker.id" :knocker />
    </div>
  </StyledCard>
  <StyledCard v-else-if="joinNoticeParticipant" left="[50%]" mt-4 px-4 py-3 top-0 absolute translate-x="[-50%]">
    <div flex gap-x-3 items-center>
      <StyledAvatar :image="joinNoticeParticipant.image" :name="joinNoticeParticipant.name" />
      <span font-medium text-body-medium>{{ joinNoticeParticipant.name }} joined the call</span>
      <v-btn icon="mdi-close" size="small" variant="plain" @click="clearJoinNotice()" />
    </div>
  </StyledCard>
</template>
