<script setup lang="ts">
interface Props {
  // The rarity whose stars are drawn, one star for each rarity
  rarity: number;
}

const { rarity } = defineProps<Props>();
</script>

<template>
  <!-- The game's rarity stars: one star for each rarity, in the game's gold -->
  <span class="stars">{{ "★".repeat(rarity) }}</span>
</template>

<style scoped>
.stars {
  color: #ffcc32;
  white-space: nowrap;
}
</style>
