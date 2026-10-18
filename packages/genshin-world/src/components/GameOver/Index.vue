<script setup lang="ts">
interface Props {
  // The button's words in the reader's language
  reviveLabel: string;
  // The game's own words for the screen's title, once every member of the deployed team has fallen
  title: string;
}

const { reviveLabel, title } = defineProps<Props>();
const emit = defineEmits<{ revive: [] }>();
</script>

<template>
  <!-- The game over screen, shown once every member of the deployed team has fallen: its title over a veil, and Revive
       under it, which brings the team back at the nearest teleport waypoint -->
  <div class="game-over">
    <h1 class="title">{{ title }}</h1>
    <button class="revive" type="button" @click="emit('revive')">{{ reviveLabel }}</button>
  </div>
</template>

<style scoped>
/* Provisional: the screen's look follows the wiki's description of it, and waits on a recording to measure against */
.game-over {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: calc(var(--unit) * 40);
  background: rgb(0 0 0 / 0.6);
  color: #ece5d8;
}

.title {
  margin: 0;
  font-size: calc(var(--unit) * 36);
  font-weight: 600;
}

.revive {
  min-width: calc(var(--unit) * 240);
  padding: calc(var(--unit) * 14) calc(var(--unit) * 32);
  border: none;
  border-radius: calc(var(--unit) * 8);
  background: rgb(255 255 255 / 0.15);
  color: #ece5d8;
  cursor: pointer;
  font: inherit;
  font-size: calc(var(--unit) * 24);
  font-weight: 600;
}
</style>
