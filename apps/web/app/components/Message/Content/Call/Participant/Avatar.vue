<script setup lang="ts">
import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

interface Props {
  isSpeaking: boolean;
  participant: CallParticipant;
}

const { isSpeaking, participant } = defineProps<Props>();
</script>

<template>
  <span flex shrink-0 relative>
    <UiAvatar :image="participant.image ?? undefined" :name="participant.name" />
    <!-- A raised hand is a dot in the warning colour on the avatar's corner, too small a mark for the hand's own glyph -->
    <span
      v-if="participant.isHandRaised"
      aria-label="Hand raised"
      role="img"
      bg-warning
      size-3
      pointer-events-none
      right-0
      top-0
      absolute
      ui-pill
    />
    <!-- Whoever is speaking glows in the accent, easing in and out with their voice -->
    <span class="speaking" :data-speaking="isSpeaking || undefined" pointer-events-none inset-0 absolute ui-pill />
  </span>
</template>

<style scoped>
.speaking {
  opacity: 0;
  box-shadow:
    0 0 0 var(--ui-indicator-width) var(--ui-accent),
    0 0 0.5rem 0.25rem color-mix(in srgb, var(--ui-accent) 40%, transparent);
  transition: opacity var(--ui-motion-short);
}

.speaking[data-speaking] {
  opacity: 1;
}
</style>
