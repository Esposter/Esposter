<script setup lang="ts">
import type { PickableEmoji } from "@/models/message/emoji/PickableEmoji";
import type { SkinTone } from "@/models/message/emoji/SkinTone";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";

interface Props {
  emojis: PickableEmoji[];
  skinTone: SkinTone;
}

const { emojis, skinTone } = defineProps<Props>();
// Hover is reported with no emoji when the pointer leaves an emoji, because whatever is showing the preview has
// Standing content of its own to put back — a preview that outlived the pointer would hold that space for good.
// Crossing from one emoji to the next reports the leave before the enter, which Vue renders as one update
defineEmits<{ hover: [emoji?: PickableEmoji]; select: [emoji: PickableEmoji] }>();
</script>

<template>
  <!-- One category at a time, so the largest list is under four hundred buttons and needs no virtualisation. Each is
    The library's quiet button drawn by its rule rather than its component, which would mount a primitive per cell -->
  <div flex-1 gap-0.5 grid cols-8 min-h-0 content-start of-y-auto>
    <button
      v-for="emoji of emojis"
      :key="emoji.slug"
      :aria-label="emoji.name"
      :data-variant="UiButtonVariant.Quiet"
      type="button"
      ui-button
      px-0
      aspect-square
      ui-title
      @blur="$emit('hover')"
      @click="$emit('select', emoji)"
      @focus="$emit('hover', emoji)"
      @mouseenter="$emit('hover', emoji)"
      @mouseleave="$emit('hover')"
    >
      <StyledEmoji :emoji :skin-tone />
    </button>
  </div>
</template>
