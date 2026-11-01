<script setup lang="ts">
import type { CharacterMenuEntry } from "#src/models/CharacterMenuEntry";

import { INTERACTION_HOVER_MS, INTERACTION_REST_MS } from "#src/services/constants";

interface Props {
  // The player's characters, across the screen's top in the order given
  characters: CharacterMenuEntry[];
}

const characterId = defineModel<number>("characterId", { required: true });
const { characters } = defineProps<Props>();
const hoverDuration = `${INTERACTION_HOVER_MS}ms`;
const restDuration = `${INTERACTION_REST_MS}ms`;
</script>

<template>
  <ul class="characters">
    <li v-for="{ id, name } of characters" :key="id">
      <button class="character ring-button" :aria-pressed="id === characterId" type="button" @click="characterId = id">
        {{ name }}
      </button>
    </li>
  </ul>
</template>

<style scoped src="../../../styles/ringButton.css"></style>

<style scoped>
/* The list's overflow clips at its padding edge, so the padding holds what the portraits draw outside their own 69 units:
   the chosen one's underline below, and above and left of the first one the 1 unit ring a hover or focus lights. The
   list stands that unit up and left, so the portraits stay where they were */
.characters {
  position: absolute;
  top: calc(var(--unit) * 11.5);
  left: calc(var(--unit) * 607);
  display: flex;
  gap: calc(var(--unit) * 27);
  margin: 0;
  padding: calc(var(--unit) * 1) 0 calc(var(--unit) * 14) calc(var(--unit) * 1);
  list-style: none;
  overflow-x: auto;
}

/* The portraits are the game's own art, which the app does not carry, so each is a disc of the art's mean tone across the
   roster, measured off the frame's portraits, with its name on it. The chosen one's cyan underline sits 79 units below
   the top of its portrait */
.character {
  --hover-duration: v-bind(hoverDuration);
  --state-duration: v-bind(restDuration);
  position: relative;
  display: grid;
  width: calc(var(--unit) * 69);
  height: calc(var(--unit) * 69);
  flex: none;
  padding: 0;
  border: calc(var(--unit) * 3) solid #9bbf4b;
  outline: calc(var(--unit) * 1) solid transparent;
  border-radius: 50%;
  background: rgb(171 154 146);
  color: inherit;
  cursor: inherit;
  font: inherit;
  font-size: calc(var(--unit) * 11);
  place-items: center;
}

/* A portrait lights a white ring when hovered or focused (`ringButton.css`), and a press dims it, its size held */
.character:is(:active, [data-pressed], [data-interaction-state="Pressed"] *) {
  --state-duration: 0s;
  filter: brightness(0.9);
}

.character[aria-pressed="true"] {
  border-color: #7fd6e0;
}

.character[aria-pressed="true"]::after {
  position: absolute;
  top: calc(var(--unit) * 79);
  left: calc(var(--unit) * -13.5);
  width: calc(var(--unit) * 96);
  height: calc(var(--unit) * 4);
  background: #78e2f0;
  content: "";
}
</style>
