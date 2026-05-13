<script setup lang="ts">
import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

interface CallParticipantTileProps {
  isDeafened: boolean;
  isSelf: boolean;
  isSpeaking: boolean;
  participant: CallParticipant;
  videoStream: MediaStream | undefined;
}

const { isDeafened, isSelf, isSpeaking, participant, videoStream } = defineProps<CallParticipantTileProps>();
const displayName = computed(() => (isSelf ? `${participant.name} (You)` : participant.name));
</script>

<template>
  <div
    b-1
    b-border
    rd-2
    b-solid
    bg-surface
    flex
    flex-col
    aspect-video
    items-center
    justify-center
    relative
    overflow-hidden
    elevation-3
  >
    <div v-if="isSpeaking" b-success b-2 rd-2 b-solid pointer-events-none inset-0 absolute animate-pulse />
    <video
      v-if="videoStream"
      autoplay
      playsinline
      size-full
      inset-0
      absolute
      object-cover
      :srcObject.prop="videoStream"
      :muted="isSelf"
    />
    <div v-else bg-surface-variant flex size-full items-center justify-center>
      <StyledAvatar :image="participant.image" :name="participant.name" :avatar-props="{ size: '6rem' }" />
    </div>
    <div m-2 px-2 py-1 rd bg-surface-opacity-80 flex gap-x-2 items-center bottom-0 left-0 absolute>
      <span text-caption text-on-surface font-medium truncate>
        {{ displayName }}
      </span>
      <v-icon v-if="participant.isCameraEnabled" text-success icon="mdi-video" size="small" />
      <v-icon v-if="participant.isMuted" text-on-surface icon="mdi-microphone-off" size="small" />
      <v-icon v-if="isDeafened" text-on-surface icon="mdi-headphones-off" size="small" />
    </div>
  </div>
</template>
