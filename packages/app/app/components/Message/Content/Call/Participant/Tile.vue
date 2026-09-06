<script setup lang="ts">
import type { CallParticipantTileProps } from "@/models/message/room/call/CallParticipantTileProps";

const { isDeafened, isScreenSharing, isSelf, isSpeaking, participant, videoStream } =
  defineProps<CallParticipantTileProps>();
</script>

<template>
  <StyledCard
    rd-lg
    flex
    flex-col
    items-center
    justify-center
    relative
    :card-props="{ ripple: false }"
    :class="
      isSpeaking
        ? 'shadow-[0_0_0_0.125rem_rgb(var(--v-theme-primary)),0_0_1rem_0.375rem_rgba(var(--v-theme-primary),0.4)]!'
        : undefined
    "
  >
    <video
      v-if="videoStream"
      autoplay
      playsinline
      rd-lg
      size-full
      absolute
      object-cover
      :srcObject.prop="videoStream"
      :muted="isSelf"
    />
    <div v-else flex size-full items-center justify-center>
      <StyledAvatar :image="participant.image" :name="participant.name" :avatar-props="{ size: '6rem' }" />
    </div>
    <MessageContentCallParticipantActionMenu v-if="!isSelf" :participant>
      <template #activator="{ props: menuProps }">
        <v-tooltip text="More Options">
          <template #activator="{ props: tooltipProps }">
            <v-btn
              m-1
              right-0
              top-0
              absolute
              :="{ ...menuProps, ...tooltipProps }"
              density="comfortable"
              icon="mdi-dots-vertical"
              variant="text"
              size="small"
            />
          </template>
        </v-tooltip>
      </template>
    </MessageContentCallParticipantActionMenu>
    <StyledCard m-2 px-2 py-1 rd-lg flex gap-x-2 items-center bottom-0 left-0 absolute>
      <span font-medium truncate text-body-small>
        {{ isSelf ? `${participant.name} (You)` : participant.name }}
      </span>
      <v-icon v-if="isScreenSharing" text-primary icon="mdi-monitor-share" size="small" />
      <v-icon v-if="participant.isHandRaised" color="warning" icon="mdi-hand-back-right" size="small" />
      <v-icon v-if="participant.isCameraEnabled" text-primary icon="mdi-video" size="small" />
      <v-icon v-if="participant.isMuted" icon="mdi-microphone-off" size="small" />
      <v-icon v-if="isDeafened" icon="mdi-headphones-off" size="small" />
    </StyledCard>
  </StyledCard>
</template>
