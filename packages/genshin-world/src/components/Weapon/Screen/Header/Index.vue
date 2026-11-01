<script setup lang="ts">
import type { GameText } from "genshin-text";

import { getWeaponRankText } from "#src/services/weapon/getWeaponRankText";
import { WeaponMenuTab } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language, which the talent's label and the rank's text are set from
  gameText: GameText;
  // The Mora the wallet holds, which the header's counter reads
  mora: number;
  // The tab the body draws, beside which the header sets its talent label on every tab but Refine
  openTab: WeaponMenuTab;
  // The weapon's rarity in stars, which the screen reads aloud beside its picture
  rarity: number;
  // The weapon's refinement rank, from one to five
  refinement: number;
}

const { gameText, mora, openTab, rarity, refinement } = defineProps<Props>();
const rankText = computed(() => getWeaponRankText(gameText, refinement));
</script>

<template>
  <span class="sr-only" role="img" :aria-label="`${rarity}`" />
  <p class="refinement" :class="{ 'sr-only': openTab !== WeaponMenuTab.Refine }">
    <span class="ornament left" aria-hidden="true" />{{ rankText }}<span class="ornament right" aria-hidden="true" />
  </p>
  <span v-if="openTab !== WeaponMenuTab.Refine" class="talent" aria-hidden="true">{{
    gameText[GameTextKey.CharacterTalentEffect]
  }}</span>
  <p class="mora">{{ mora }}</p>
</template>

<style scoped>
/* Every measure is a pixel of the reference's 1920 by 864 still, through the frame's `--reference-pixel` */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.talent {
  position: absolute;
  top: calc(var(--reference-pixel) * 27);
  left: calc(var(--reference-pixel) * 1281);
  width: calc(var(--reference-pixel) * 236);
  height: calc(var(--reference-pixel) * 40);
  text-indent: calc(var(--reference-pixel) * 51);
  border-radius: calc(var(--reference-pixel) * 20);
  background: #f5d48a;
  color: #3d3d48;
  font-size: calc(var(--reference-pixel) * 25);
  font-weight: 600;
  line-height: calc(var(--reference-pixel) * 44);
  letter-spacing: calc(var(--reference-pixel) * 2.2);
  white-space: nowrap;
}

.mora {
  position: absolute;
  top: calc(var(--reference-pixel) * 27);
  left: calc(var(--reference-pixel) * 1541);
  width: calc(var(--reference-pixel) * 161);
  height: calc(var(--reference-pixel) * 40);
  margin: 0;
  padding-left: calc(var(--reference-pixel) * 57);
  border-radius: calc(var(--reference-pixel) * 20);
  background: rgb(20 16 50 / 0.35);
  color: #e7e9f6;
  font-size: calc(var(--reference-pixel) * 25);
  font-weight: 600;
  line-height: calc(var(--reference-pixel) * 40);
}

/* The rank the header sets over its panel, centred between the frame's two ornaments */
.refinement {
  position: absolute;
  top: calc(var(--reference-pixel) * 98);
  left: calc(var(--reference-pixel) * 1097);
  width: calc(var(--reference-pixel) * 706);
  margin: 0;
  color: #f6f0f9;
  font-size: calc(var(--reference-pixel) * 42);
  font-weight: 600;
  line-height: 1;
  text-align: center;
}

/* The rank's two ornaments, a hairline with a sparkle at its end either side of the rank */
.ornament {
  position: absolute;
  top: 50%;
  width: calc(var(--reference-pixel) * 36);
  height: calc(var(--reference-pixel) * 1);
  background: #cfc8dc;
  translate: 0 -50%;
}

.ornament::before {
  position: absolute;
  top: calc(var(--reference-pixel) * -5);
  width: calc(var(--reference-pixel) * 10);
  height: calc(var(--reference-pixel) * 10);
  background: #e3dded;
  clip-path: var(--sparkle-clip-path);
  content: "";
}

.ornament.left {
  left: calc(var(--reference-pixel) * 235);
}

.ornament.left::before {
  right: calc(var(--reference-pixel) * -5);
}

.ornament.right {
  right: calc(var(--reference-pixel) * 236);
}

.ornament.right::before {
  left: calc(var(--reference-pixel) * -5);
}

/* The gold coin beside the wallet's Mora */
.mora::before {
  position: absolute;
  top: calc(var(--reference-pixel) * 5);
  left: calc(var(--reference-pixel) * 11);
  width: calc(var(--reference-pixel) * 30);
  height: calc(var(--reference-pixel) * 30);
  border-radius: 50%;
  background: radial-gradient(circle at 40% 35%, #fff7c8, #f7d25a 60%, #d9a53a);
  content: "";
}
</style>
