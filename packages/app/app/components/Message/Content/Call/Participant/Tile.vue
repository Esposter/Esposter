<script setup lang="ts">
import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

export interface CallParticipantTileProps {
  isDeafened: boolean;
  isHandRaised: boolean;
  isScreenSharing: boolean;
  isSelf: boolean;
  isSpeaking: boolean;
  participant: CallParticipant;
  videoStream: MediaStream | undefined;
}

const { isDeafened, isHandRaised, isScreenSharing, isSelf, isSpeaking, participant, videoStream } =
  defineProps<CallParticipantTileProps>();
const displayName = computed(() => (isSelf ? `${participant.name} (You)` : participant.name));
</script>

<template>
  <div b-1 b-border rd-2 b-solid bg-surface flex flex-col items-center justify-center relative elevation-3>
    <video
      v-if="videoStream"
      autoplay
      playsinline
      rd-2
      size-full
      absolute
      object-cover
      :srcObject.prop="videoStream"
      :muted="isSelf"
    />
    <StyledCard v-else rd-2 flex size-full items-center justify-center>
      <StyledAvatar :image="participant.image" :name="participant.name" :avatar-props="{ size: '6rem' }" />
    </StyledCard>
    <div
      v-if="isSpeaking"
      rd-2
      pointer-events-none
      inset-0
      absolute
      shadow="[inset_0_0_0_3px_rgb(var(--v-theme-primary)),0_0_0_1px_rgb(var(--v-theme-primary)),0_0_16px_6px_rgba(var(--v-theme-primary),0.4)]"
    />
    <StyledCard m-2 px-2 py-1 rd-2 flex gap-x-2 items-center bottom-0 left-0 absolute>
      <span font-medium truncate text-body-small>
        {{ displayName }}
      </span>
      <v-icon v-if="isScreenSharing" text-primary icon="mdi-monitor-share" size="small" />
      <v-icon v-if="isHandRaised" text-warning icon="mdi-hand-back-right" size="small" />
      <v-icon v-if="participant.isCameraEnabled" text-primary icon="mdi-video" size="small" />
      <v-icon v-if="participant.isMuted" icon="mdi-microphone-off" size="small" />
      <v-icon v-if="isDeafened" icon="mdi-headphones-off" size="small" />
    </StyledCard>
  </div>
</template>
