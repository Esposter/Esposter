<script setup lang="ts">
import { useCallStore } from "@/store/message/room/call";

const callStore = useCallStore();
const { clearJoinNotice } = callStore;
const { joinNoticeParticipant } = storeToRefs(callStore);
</script>

<template>
  <StyledCard v-if="joinNoticeParticipant" mt-4 px-4 py-3 absolute left="[50%]" top-0 translate-x="[-50%]">
    <div flex items-center gap-x-3>
      <StyledAvatar :image="joinNoticeParticipant.image" :name="joinNoticeParticipant.name" />
      <span text-body-medium font-medium>{{ joinNoticeParticipant.name }} wants to join the call</span>
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
