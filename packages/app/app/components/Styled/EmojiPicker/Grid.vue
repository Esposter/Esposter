<script setup lang="ts">
import type { PickableEmoji } from "@/models/message/emoji/PickableEmoji";
import type { SkinTone } from "@/models/message/emoji/SkinTone";

interface StyledEmojiPickerGridProps {
  emojis: PickableEmoji[];
  skinTone: SkinTone;
}

const { emojis, skinTone } = defineProps<StyledEmojiPickerGridProps>();
defineEmits<{ hover: [emoji: PickableEmoji]; select: [emoji: PickableEmoji] }>();
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
      <StyledEmoji :emoji :skin-tone />
    </button>
  </div>
</template>
