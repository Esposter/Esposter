<script setup lang="ts">
import { useCallParticipantStore } from "@/store/message/room/call/participant";

const participantStore = useCallParticipantStore();
const { clearJoinNotice } = participantStore;
const { joinNoticeParticipant } = storeToRefs(participantStore);
</script>

<template>
  <StyledCard v-if="joinNoticeParticipant" left="[50%]" mt-4 px-4 py-3 top-0 absolute translate-x="[-50%]">
    <div flex gap-x-3 items-center>
      <StyledAvatar :image="joinNoticeParticipant.image" :name="joinNoticeParticipant.name" />
      <span font-medium text-body-medium>{{ joinNoticeParticipant.name }} wants to join the call</span>
      <v-tooltip text="Let in">
        <template #activator="{ props }">
          <v-btn :="props" color="primary" icon="mdi-check" size="small" variant="tonal" @click="clearJoinNotice()" />
        </template>
      </v-tooltip>
      <v-tooltip text="Dismiss">
        <template #activator="{ props }">
          <v-btn :="props" icon="mdi-close" size="small" variant="plain" @click="clearJoinNotice()" />
        </template>
      </v-tooltip>
    </div>
  </StyledCard>
</template>
