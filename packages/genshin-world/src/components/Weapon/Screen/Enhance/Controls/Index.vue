<script setup lang="ts">
import type { GameText } from "genshin-text";

import { GAME_INK } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language, which the Enhance panel's pills are labelled in
  gameText: GameText;
}

const { gameText } = defineProps<Props>();
</script>

<template>
  <span class="pill auto-add" aria-hidden="true">{{ gameText[GameTextKey.ArtifactAutoAdd] }}</span>
  <span class="pill filter" aria-hidden="true"
    >{{ gameText[GameTextKey.WeaponMaterialsThreeStarAndUnder] }}<span class="caret"
  /></span>
  <span class="sparkle-button" aria-hidden="true" />
</template>

<style scoped src="../../../../../styles/weaponScreen.css"></style>

<style scoped>
.filter {
  top: calc(var(--reference-pixel) * 527);
  left: calc(var(--reference-pixel) * 1103);
  width: calc(var(--reference-pixel) * 458);
  text-indent: calc(var(--reference-pixel) * 22);
  font-size: calc(var(--reference-pixel) * 25);
  letter-spacing: calc(var(--reference-pixel) * 1.8);
  text-align: left;
}

/* The round cream button beside Enhance, its glyph left undrawn */
.sparkle-button {
  position: absolute;
  top: calc(var(--reference-pixel) * 772);
  left: calc(var(--reference-pixel) * 1424);
  width: calc(var(--reference-pixel) * 64);
  height: calc(var(--reference-pixel) * 64);
  border-radius: 50%;
  background: #e5dddd;
}

.caret {
  position: absolute;
  top: calc(var(--reference-pixel) * 21);
  left: calc(var(--reference-pixel) * 424);
  border-top: calc(var(--reference-pixel) * 9) solid v-bind(GAME_INK);
  border-right: calc(var(--reference-pixel) * 7) solid transparent;
  border-left: calc(var(--reference-pixel) * 7) solid transparent;
}

/* The round cream button's sparkle: a large star and a small one at its lower right */
.sparkle-button::before,
.sparkle-button::after {
  position: absolute;
  background: #35344a;
  clip-path: var(--sparkle-clip-path);
  content: "";
}

.sparkle-button::before {
  top: calc(var(--reference-pixel) * 14);
  left: calc(var(--reference-pixel) * 16);
  width: calc(var(--reference-pixel) * 34);
  height: calc(var(--reference-pixel) * 34);
}

.sparkle-button::after {
  top: calc(var(--reference-pixel) * 28);
  left: calc(var(--reference-pixel) * 43);
  width: calc(var(--reference-pixel) * 16);
  height: calc(var(--reference-pixel) * 16);
}
</style>
