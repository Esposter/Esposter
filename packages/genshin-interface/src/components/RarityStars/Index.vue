<script setup lang="ts">
interface Props {
  // The CSS colour the stars are drawn in, the game's gold when empty
  color: string;
  // The rarity whose stars are drawn, one star for each rarity
  rarity: number;
}

defineProps<Props>();
</script>

<template>
  <!-- The game's rarity stars: one star for each rarity, in the game's gold -->
  <span class="stars" :style="color && { color }">{{ "★".repeat(rarity) }}</span>
</template>

<style scoped>
.stars {
  color: #ffcc32;
  white-space: nowrap;
}
</style>
