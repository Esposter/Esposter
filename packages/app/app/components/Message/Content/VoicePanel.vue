<script setup lang="ts">
import { useVoiceStore } from "@/store/message/room/voice";

const voiceStore = useVoiceStore();
const { leaveVoice, toggleDeafen, toggleMute } = voiceStore;
const { isDeafened, isInChannel, isMuted, roomParticipants, sessionId, speakingIds } = storeToRefs(voiceStore);
const isCollapsed = useLocalStorage("voicePanel:isCollapsed", false);
</script>

<template>
  <TransitionFade>
    <div v-if="isInChannel" class="bg-surface-variant" border-b flex items-center gap-x-3 px-4 py-2>
      <v-icon icon="mdi-volume-high" size="small" color="success" />
      <span text-sm font-medium flex-1>Voice</span>
      <template v-if="!isCollapsed">
        <div flex items-center gap-x-1>
          <div v-for="{ id, image, isMuted: participantIsMuted, name } of roomParticipants" :key="id" relative>
            <StyledAvatar size="x-small" :image :name />
            <div
              v-if="speakingIds.includes(id)"
              absolute
              inset-0
              animate-pulse
              outline="2 solid green-500 offset-1"
              pointer-events-none
              rd-full
            />
            <v-icon v-if="participantIsMuted" icon="mdi-microphone-off" size="x-small" absolute bottom-0 right-0 />
            <v-icon
              v-if="isDeafened && id === sessionId"
              icon="mdi-headphones-off"
              size="x-small"
              absolute
              bottom-0
              left-0
            />
          </div>
        </div>
        <v-tooltip :text="isMuted ? 'Unmute' : 'Mute'" location="bottom">
          <template #activator="{ props }">
            <v-btn
              :="props"
              :icon="isMuted ? 'mdi-microphone-off' : 'mdi-microphone'"
              :color="isMuted ? 'error' : undefined"
              size="x-small"
              variant="plain"
              :ripple="false"
              @click="toggleMute"
            />
          </template>
        </v-tooltip>
        <v-tooltip :text="isDeafened ? 'Undeafen' : 'Deafen'" location="bottom">
          <template #activator="{ props }">
            <v-btn
              :="props"
              :icon="isDeafened ? 'mdi-headphones-off' : 'mdi-headphones'"
              :color="isDeafened ? 'error' : undefined"
              size="x-small"
              variant="plain"
              :ripple="false"
              @click="toggleDeafen"
            />
          </template>
        </v-tooltip>
        <v-tooltip text="Leave Voice" location="bottom">
          <template #activator="{ props }">
            <v-btn
              :="props"
              icon="mdi-phone-hangup"
              color="error"
              size="x-small"
              variant="tonal"
              :ripple="false"
              @click="leaveVoice"
            />
          </template>
        </v-tooltip>
      </template>
      <v-tooltip :text="isCollapsed ? 'Expand' : 'Collapse'" location="bottom">
        <template #activator="{ props }">
          <v-btn
            :="props"
            :icon="isCollapsed ? 'mdi-chevron-down' : 'mdi-chevron-up'"
            size="x-small"
            variant="plain"
            :ripple="false"
            @click="isCollapsed = !isCollapsed"
          />
        </template>
      </v-tooltip>
    </div>
  </TransitionFade>
</template>
