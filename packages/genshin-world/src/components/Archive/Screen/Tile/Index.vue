<script setup lang="ts">
import type { GameText } from "genshin-text";

import { TWO_LINE_NAME_LENGTH } from "#src/services/archive/constants";
import { GameButton, GameButtonKind, ItemRarityFaceGradientMap } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language, which the tile's "New" badge is set in
  gameText: GameText;
  // Whether the tile is drawn dimmed
  isDimmed: boolean;
  // Whether the tile wears a "New" badge
  isNew: boolean;
  // Whether the tile is the one the detail pane shows, which outlines it
  isSelected: boolean;
  // The defeats the tile counts beside its name, absent for an entry that counts none
  kills?: number;
  // The name the tile shows, which reads "?" while the entry is unopened
  name: string;
  // The entry's rarity in stars, which tints the tile and draws its stars, absent for an entry the weapon data gives none
  rarity?: number;
}

const { gameText, isDimmed, isNew, isSelected, kills, name, rarity } = defineProps<Props>();
const emit = defineEmits<{ click: [] }>();
// The face gradient of a four or five star tile, held as one style so the button is not handed a fresh object on each render
const faceStyle = computed(() => ({
  background: rarity !== undefined && rarity >= 4 ? ItemRarityFaceGradientMap[rarity] : undefined,
}));
</script>

<template>
  <!-- A four or five star weapon's tile takes its face gradient from the item tile, which owns the gradients. The two and three
       star tiles keep the flat tints in the stylesheet -->
  <GameButton
    class="tile"
    :aria-pressed="isSelected"
    :data-dimmed="isDimmed || undefined"
    :data-rarity="rarity"
    :kind="GameButtonKind.Row"
    :style="faceStyle"
    tip=""
    @click="emit('click')"
  >
    <span class="name" :data-two-lines="name.length > TWO_LINE_NAME_LENGTH || undefined">
      <span class="label">{{ name }}</span>
      <span v-if="kills !== undefined" class="kills">×{{ kills }}</span>
    </span>
    <span class="stars" aria-hidden="true"><span v-for="star in rarity ?? 0" :key="star" class="star" /></span>
    <span v-if="isNew" class="new">{{ gameText[GameTextKey.New] }}</span>
  </GameButton>
</template>

<style scoped>
.tile {
  position: relative;
  display: flex;
  margin: 0;
  padding: 0;
  border: none;
  background: #595d67;
  color: inherit;
  cursor: inherit;
  font: inherit;
  align-items: end;
}

.tile[data-rarity="2"] {
  background: #507a71;
}

.tile[data-rarity="3"] {
  background: #4f6a8f;
}

.tile[data-dimmed] {
  filter: brightness(0.5);
}

@media (hover: hover) {
  .tile:hover {
    outline: calc(var(--unit) * 2) solid #f4f7ff;
  }
}

.tile[aria-pressed="true"] {
  outline: calc(var(--unit) * 2) solid #f4f7ff;
}

.name {
  display: flex;
  width: 100%;
  height: calc(var(--unit) * 29);
  padding: 0 calc(var(--unit) * 4);
  background: #e5e4dd;
  color: #2b2f3a;
  font-size: calc(var(--unit) * 17.5);
  font-weight: 600;
  line-height: calc(var(--unit) * 15);
  text-align: center;
  overflow: hidden;
  align-items: center;
  justify-content: center;
}

/* A two-line name is set at the game's cap height, letter-spaced to its width */
.name[data-two-lines] {
  font-size: calc(var(--unit) * 16);
  line-height: calc(var(--unit) * 14);
  letter-spacing: calc(var(--unit) * 1.1);
}

/* Set under the game's cap height, as its face is wider than Signika there, so a single line is letter-spaced to its width */
.name:not([data-two-lines]) .label {
  letter-spacing: calc(var(--unit) * 1.6);
  white-space: nowrap;
}

.name[data-two-lines] .label {
  max-width: calc(var(--unit) * 100);
  text-wrap: balance;
}

.kills {
  margin-inline-start: calc(var(--unit) * 8);
}

/* The stars sit centred on the band's top edge, one for each of the weapon's stars */
.stars {
  position: absolute;
  top: calc(var(--unit) * 96);
  right: 0;
  left: 0;
  display: flex;
  justify-content: center;
  gap: calc(var(--unit));
}

.star {
  width: calc(var(--unit) * 18);
  height: calc(var(--unit) * 18);
  background: #fbcd3f;
  clip-path: polygon(50% 0, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
}

/* A badge stands on its tile's top-right corner, with a sparkle at each of its two corners that reach past it */
.new {
  position: absolute;
  top: calc(var(--unit) * -4);
  left: calc(var(--unit) * 49);
  width: calc(var(--unit) * 68);
  height: calc(var(--unit) * 31);
  border-radius: calc(var(--unit) * 4);
  background: linear-gradient(#e9b24c, #c8851f);
  color: #fffb6a;
  font-size: calc(var(--unit) * 23);
  font-weight: 700;
  line-height: calc(var(--unit) * 31);
  text-align: center;
}

.new::before,
.new::after {
  position: absolute;
  width: calc(var(--unit) * 12);
  height: calc(var(--unit) * 12);
  background: #fdd65a;
  clip-path: var(--sparkle-clip-path);
  content: "";
}

.new::before {
  top: calc(var(--unit) * -5);
  right: calc(var(--unit) * -4);
}

.new::after {
  top: calc(var(--unit) * 25);
  left: calc(var(--unit) * -6);
}
</style>
