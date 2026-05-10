<script setup lang="ts">
import { useVoiceStore } from "@/store/message/room/voice";
import { mergeProps } from "vue";

const voiceStore = useVoiceStore();
const { joinVoice, leaveVoice } = voiceStore;
const { isInChannel, roomParticipants } = storeToRefs(voiceStore);
</script>

<template>
  <v-menu v-if="isInChannel" location="bottom end">
    <template #activator="{ props: menuProps }">
      <v-tooltip location="bottom" text="Voice Call">
        <template #activator="{ props: tooltipProps }">
          <v-btn :="mergeProps(menuProps, tooltipProps)" size="small" color="success" variant="text">
            <v-icon icon="mdi-phone" />
            <span ml-1>{{ roomParticipants.length }}</span>
          </v-btn>
        </template>
      </v-tooltip>
    </template>
    <StyledCard>
      <v-list density="compact" min-w-40>
        <v-list-item v-for="{ id, image, isMuted, name } of roomParticipants" :key="id" :title="name">
          <template #prepend>
            <StyledAvatar :image :name mr-2 />
          </template>
          <template #append>
            <v-icon v-if="isMuted" icon="mdi-microphone-off" size="small" />
          </template>
        </v-list-item>
        <v-divider />
        <v-list-item prepend-icon="mdi-phone-hangup" title="Leave Call" base-color="error" @click="leaveVoice()" />
      </v-list>
    </StyledCard>
  </v-menu>
  <v-tooltip v-else location="bottom" text="Start Voice Call">
    <template #activator="{ props }">
      <v-btn :="props" icon="mdi-phone" size="small" @click="joinVoice()" />
    </template>
  </v-tooltip>
</template>
