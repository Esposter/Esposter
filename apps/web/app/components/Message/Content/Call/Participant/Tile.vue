<script setup lang="ts">
import type { CallParticipantTileProps } from "@/models/message/room/call/CallParticipantTileProps";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

const { isDeafened, isScreenSharing, isSelf, isSpeaking, participant, videoStream } =
  defineProps<CallParticipantTileProps>();
const emit = defineEmits<{ click: [] }>();
const name = computed(() => (isSelf ? `${participant.name} (You)` : participant.name));
</script>

<template>
  <div flex items-center justify-center relative ui-frame>
    <video
      v-if="videoStream"
      autoplay
      playsinline
      rd="[var(--ui-container-radius)]"
      size-full
      absolute
      object-cover
      :srcObject.prop="videoStream"
      :muted="isSelf"
    />
    <UiAvatar v-else :image="participant.image ?? undefined" :name="participant.name" is-large />
    <!-- The whole tile pins its participant, drawn under the tile's own controls so each stays its own stop -->
    <button :aria-label="`Pin ${name}`" type="button" cursor-pointer inset-0 absolute @click="emit('click')" />
    <!-- Whoever is speaking glows in the accent, easing in and out with their voice -->
    <div
      class="speaking"
      :data-speaking="isSpeaking || undefined"
      rd="[var(--ui-container-radius)]"
      pointer-events-none
      inset-0
      absolute
    />
    <MessageContentCallParticipantActionMenu v-if="!isSelf" :participant right-2 top-2 absolute />
    <div text-sm m-2 px-2 flex gap-1 h-8 max-w="[calc(100%-1rem)]" items-center bottom-0 left-0 absolute ui-lifted>
      <span min-w-0 truncate>{{ name }}</span>
      <UiIcon v-if="isScreenSharing" :meaning="UiIconMeaning.ScreenShare" text-accent />
      <UiIcon v-if="participant.isHandRaised" :meaning="UiIconMeaning.RaiseHand" text-warning />
      <UiIcon v-if="participant.isCameraEnabled" :meaning="UiIconMeaning.Camera" text-accent />
      <UiIcon v-if="participant.isMuted" :meaning="UiIconMeaning.MicrophoneOff" text-muted />
      <UiIcon v-if="isDeafened" :meaning="UiIconMeaning.Undeafen" text-muted />
    </div>
  </div>
</template>

<style scoped>
.speaking {
  opacity: 0;
  box-shadow:
    inset 0 0 0 var(--ui-indicator-width) var(--ui-accent),
    0 0 1rem 0.375rem color-mix(in srgb, var(--ui-accent) 40%, transparent);
  transition: opacity var(--ui-motion-short);
}

.speaking[data-speaking] {
  opacity: 1;
}
</style>
