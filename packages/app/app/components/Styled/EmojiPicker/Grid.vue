<script setup lang="ts">
import type { Emoji } from "@/models/message/emoji/Emoji";
import type { SkinTone } from "@/models/message/emoji/SkinTone";

import { applySkinTone } from "@/services/message/emoji/applySkinTone";

interface StyledEmojiPickerGridProps {
  emojis: Emoji[];
  skinTone: SkinTone;
}

const { emojis, skinTone } = defineProps<StyledEmojiPickerGridProps>();
defineEmits<{ hover: [emoji: Emoji]; select: [emoji: Emoji] }>();
</script>

<template>
  <!-- One category at a time, so the largest list is under four hundred buttons and needs no virtualisation -->
  <div p-1 flex-1 gap-0.5 grid grid-cols-8 overflow-y-auto>
    <button
      v-for="emoji of emojis"
      :key="emoji.slug"
      :aria-label="emoji.name"
      leading-none
      rd
      b-none
      bg-transparent
      aspect-square
      cursor-pointer
      active:bg-surface-opacity-80
      hover:bg-surface-opacity-80
      text-title-large
      type="button"
      @click="$emit('select', emoji)"
      @focus="$emit('hover', emoji)"
      @mouseenter="$emit('hover', emoji)"
    >
      {{ applySkinTone(emoji, skinTone) }}
    </button>
  </div>
</template>
