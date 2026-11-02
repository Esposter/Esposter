<script setup lang="ts">
import type { CharacterMenuTab } from "#src/models/CharacterMenuTab";

import { CharacterMenuTabs } from "#src/models/CharacterMenuTab";
import {
  GAME_CREAM,
  GAME_ROW_HOVER,
  GAME_ROW_PRESS,
  INTERACTION_HOVER_DURATION,
  INTERACTION_REST_DURATION,
} from "#src/services/constants";

interface Props {
  // Each tab's name in the reader's language
  tabLabels: Record<CharacterMenuTab, string>;
}

const tab = defineModel<CharacterMenuTab>("tab", { required: true });
const { tabLabels } = defineProps<Props>();
</script>

<template>
  <ul class="tabs">
    <li v-for="menuTab of CharacterMenuTabs" :key="menuTab">
      <button class="tab fill-tint" :aria-pressed="menuTab === tab" type="button" @click="tab = menuTab">
        {{ tabLabels[menuTab] }}
      </button>
    </li>
  </ul>
</template>

<style scoped src="../../../styles/fillTint.css"></style>

<style scoped>
/* The tabs down the left, measured off each tab's own frame of the recording (155 to 159 seconds): the rows on a
   69.6-unit pitch, the first's words centred 155.8 units down. Each row spans the column from the frame's left, so its
   word and its diamond are placed from the frame's own edge */
.tabs {
  position: absolute;
  top: calc(var(--unit) * 121);
  left: 0;
  width: calc(var(--unit) * 560);
  margin: 0;
  padding: 0;
  list-style: none;
}

.tabs li {
  height: calc(var(--unit) * 69.6);
}

/* A closed tab's word starts 216 units in, its ascenders 25.5 units tall in a cream a little short of white, letter-spaced
   out to the game's width, with a faint shadow round it */
.tab {
  --hover-duration: v-bind(INTERACTION_HOVER_DURATION);
  --rest-duration: v-bind(INTERACTION_REST_DURATION);
  --row-tint: v-bind(GAME_ROW_HOVER);
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  padding: 0 0 0 calc(var(--unit) * 216);
  border: none;
  background: transparent;
  color: rgb(206 197 176);
  cursor: inherit;
  font: inherit;
  font-size: calc(var(--unit) * 34.5);
  font-weight: 600;
  letter-spacing: calc(var(--unit) * 1.95);
  line-height: calc(var(--unit) * 69.6);
  text-align: start;
  text-shadow: 0 0 calc(var(--unit) * 3) rgb(0 0 0 / 0.2);
}

/* A press tints the row at once, over the tint `fillTint.css` draws behind its word and its diamond */
.tab:is(:active, [data-pressed], [data-interaction-state="Pressed"] *) {
  --state-duration: 0s;
  background-color: v-bind(GAME_ROW_PRESS);
}

/* A closed tab's diamond, 15 units corner to corner and centred 196.9 units in, the word's cream at half strength */
.tab::before {
  position: absolute;
  top: calc(50% - var(--unit) * 1.3);
  left: calc(var(--unit) * 191.6);
  width: calc(var(--unit) * 10.6);
  height: calc(var(--unit) * 10.6);
  background: color-mix(in srgb, v-bind(GAME_CREAM) 50%, transparent);
  content: "";
  transform: translateY(-50%) rotate(45deg);
}

/* The open tab's word is a fifth larger and near white, 9.75 units further in, blooming into the light behind it */
.tab[aria-pressed="true"] {
  z-index: 0;
  padding-left: calc(var(--unit) * 225.75);
  color: rgb(244 243 235);
  font-size: calc(var(--unit) * 41.4);
  letter-spacing: calc(var(--unit) * 2.34);
  text-shadow:
    0 0 calc(var(--unit) * 4) rgb(255 248 230 / 0.8),
    0 0 calc(var(--unit) * 12) rgb(255 240 200 / 0.5);
}

/* Its diamond is a faint outline 28.5 units corner to corner on the same centre, the part of it right of a line 4.5 units
   past its centre filled near white, a head pointing right, with a light rising towards it from the left corner */
.tab[aria-pressed="true"]::before {
  top: 50%;
  left: calc(var(--unit) * 186.4);
  box-sizing: border-box;
  width: calc(var(--unit) * 20.2);
  height: calc(var(--unit) * 20.2);
  border: calc(var(--unit) * 1.6) solid color-mix(in srgb, v-bind(GAME_CREAM) 45%, transparent);
  background: linear-gradient(45deg, transparent 30%, rgb(255 250 240 / 0.45) 68.75%, rgb(236 231 219) 68.75%)
    padding-box;
}

/* Behind its word, a warm light from the word's start out to 517.5 units, a thin bright streak along the row's middle in
   a fainter haze, as the frame less its clean plate measures it */
.tab[aria-pressed="true"]::after {
  position: absolute;
  z-index: -1;
  top: 50%;
  left: calc(var(--unit) * 217.5);
  width: calc(var(--unit) * 300);
  height: calc(var(--unit) * 90);
  background:
    radial-gradient(
        closest-side,
        rgb(255 240 200 / 0.4),
        rgb(255 240 200 / 0.3) 35%,
        rgb(255 240 200 / 0.17) 55%,
        rgb(255 240 200 / 0.09) 75%,
        transparent 95%
      )
      center / 100% calc(var(--unit) * 18) no-repeat,
    radial-gradient(closest-side, rgb(255 240 200 / 0.14), rgb(255 240 200 / 0.08) 50%, transparent);
  content: "";
  transform: translateY(-50%);
}
</style>
