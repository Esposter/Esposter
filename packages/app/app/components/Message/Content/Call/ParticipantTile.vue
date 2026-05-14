<script setup lang="ts">
import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

interface CallParticipantTileProps {
  isDeafened: boolean;
  isScreenSharing: boolean;
  isSelf: boolean;
  isSpeaking: boolean;
  participant: CallParticipant;
  videoStream: MediaStream | undefined;
}

const { isDeafened, isScreenSharing, isSelf, isSpeaking, participant, videoStream } =
  defineProps<CallParticipantTileProps>();
const displayName = computed(() => (isSelf ? `${participant.name} (You)` : participant.name));
</script>

<template>
  <div
    b-1
    rd-2
    b-solid
    bg-surface
    flex
    flex-col
    items-center
    justify-center
    relative
    elevation-3
    :class="isSpeaking ? 'b-primary' : 'b-border'"
  >
    <div v-if="isSpeaking" b-2 b-primary rd-2 b-solid pointer-events-none inset-0 absolute z-1 animate-pulse />
    <video
      v-if="videoStream"
      autoplay
      playsinline
      inset-0
      absolute
      object-cover
      :srcObject.prop="videoStream"
      :muted="isSelf"
    />
    <div v-else bg-surface-opacity-80 size-full flex items-center justify-center>
      <StyledAvatar :image="participant.image" :name="participant.name" :avatar-props="{ size: '6rem' }" />
    </div>
    <div m-2 px-2 py-1 rd bg-surface-opacity-80 flex gap-x-2 items-center bottom-0 left-0 absolute>
      <span font-medium truncate text-body-small>
        {{ displayName }}
      </span>
      <v-icon v-if="isScreenSharing" text-primary icon="mdi-monitor-share" size="small" />
      <v-icon v-if="participant.isCameraEnabled" text-primary icon="mdi-video" size="small" />
      <v-icon v-if="participant.isMuted" icon="mdi-microphone-off" size="small" />
      <v-icon v-if="isDeafened" icon="mdi-headphones-off" size="small" />
    </div>
  </div>
</template>
