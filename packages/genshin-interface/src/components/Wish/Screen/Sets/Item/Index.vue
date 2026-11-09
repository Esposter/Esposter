<script setup lang="ts">
import GameButton from "#src/components/GameButton/Index.vue";
import { GameButtonKind } from "#src/models/GameButtonKind";

interface Props {
  // The cost in the Fate's or the Primogems' name and count, shown under the button's words
  cost: string;
  // Whether the wallet holds the cost, which holds the button off while it does not
  isAffordable: boolean;
  // The button's words in the reader's language
  label: string;
}

defineProps<Props>();
const emit = defineEmits<{ press: [] }>();
</script>

<template>
  <GameButton class="set" :disabled="!isAffordable" :kind="GameButtonKind.Pill" tip="" @click="emit('press')">
    <span class="set-label">{{ label }}</span>
    <span class="cost">{{ cost }}</span>
  </GameButton>
</template>

<style scoped>
.set-label {
  font-weight: 600;
}

/* The cost sits three units under the label's line, where the game's gem and its count lie */
.cost {
  position: relative;
  top: calc(var(--unit) * 3);
  font-size: calc(var(--unit) * 24);
  opacity: 0.85;
}
</style>
