<script setup lang="ts">
import type { CharacterMenuProfileEntry } from "#src/models/CharacterMenuProfileEntry";

interface Props {
  // The story or voice-over the button names, a locked one shown as such
  entry: CharacterMenuProfileEntry;
  // Whether the panel shows this entry, which the button reports as pressed
  isSelected: boolean;
}

// Its style is the Profile panel's scoped style, the button being the root that style reaches
const { entry, isSelected } = defineProps<Props>();
const emit = defineEmits<{ select: [] }>();
</script>

<template>
  <button class="entry" :aria-pressed="isSelected" :data-locked="entry.isLocked" type="button" @click="emit('select')">
    {{ entry.title }}
  </button>
</template>
