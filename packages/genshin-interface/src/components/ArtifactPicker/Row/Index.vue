<script setup lang="ts">
interface Props {
  // The caption the option shows under its name
  caption: string;
  // The artifact's name in the reader's language
  name: string;
  // Its rarity in stars, which the option carries as its data-rarity
  rarity: number;
}

const { caption, name, rarity } = defineProps<Props>();
const emit = defineEmits<{ choose: [] }>();
</script>

<template>
  <button class="option" :data-rarity="rarity" type="button" @click="emit('choose')">
    <span class="name">{{ name }}</span>
    <span class="caption">{{ caption }}</span>
  </button>
</template>

<style scoped>
.option {
  padding: calc(var(--unit) * 12) calc(var(--unit) * 16);
}

.option:hover,
.option:focus-visible {
  background: rgb(255 255 255 / 0.2);
}
</style>

<style scoped src="../../../styles/artifactPicker.css"></style>
