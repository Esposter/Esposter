<script setup lang="ts">
import type { Weapon } from "#src/models/weapon/Weapon";
import type { GameText } from "genshin-text";

import WeaponScreenAscendMaterials from "#src/components/Weapon/Screen/Ascend/Materials/Index.vue";
import WeaponScreenAscendSparks from "#src/components/Weapon/Screen/Ascend/Sparks/Index.vue";
import { DIVIDER_OPACITY } from "#src/services/weapon/constants";
import { OrnamentDivider } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The base ATK at the held phase, which the row beside the header sets against the next phase's
  baseAttackText: string;
  // The materials the next phase takes, each with its name, rarity, the count it takes and the count the bag holds
  costs: { count: number; id: number; name: string; ownedCount: number; rarity: number }[];
  // The game's words in the reader's language
  gameText: GameText;
  // The level the weapon's phase caps at, which the header's current level is drawn against
  maxLevel: number;
  // The base ATK at the next phase, which the row sets beside the held one
  nextBaseAttackText: string;
  // The level the next phase caps at, which the header's next level is drawn against
  nextMaxLevel: number;
  // The secondary attribute's label, the game's name for it, a percentage under its flat attribute's name
  secondaryLabel: string;
  // The secondary attribute at the weapon's level, as the game writes it
  secondaryText: string;
  // The weapon whose phase and level the header shows
  weapon: Weapon;
}

const {
  baseAttackText,
  costs,
  gameText,
  maxLevel,
  nextBaseAttackText,
  nextMaxLevel,
  secondaryLabel,
  secondaryText,
  weapon,
} = defineProps<Props>();
</script>

<template>
  <WeaponScreenAscendSparks :ascension="weapon.ascension" />
  <p class="level-current">
    <span class="level-word">{{ gameText[GameTextKey.LevelShort] }}</span> {{ weapon.level }} / {{ maxLevel }}
  </p>
  <span class="arrow level-arrow" aria-hidden="true" />
  <p class="level-next">
    <span class="level-word">{{ gameText[GameTextKey.LevelShort] }}</span> {{ weapon.level }} /
    <span class="next-max">{{ nextMaxLevel }}</span>
  </p>
  <p class="stat ascend-base-attack">{{ gameText[GameTextKey.AttributeBaseAttack] }}</p>
  <p class="stat-value base-current">{{ baseAttackText }}</p>
  <span class="arrow" aria-hidden="true" />
  <p class="stat-value base-next">{{ nextBaseAttackText }}</p>
  <p class="stat ascend-attack">{{ secondaryLabel }}</p>
  <p class="stat-value attack-current">{{ secondaryText }}</p>
  <OrnamentDivider class="divider ascend-divider" is-middle-hidden :opacity="DIVIDER_OPACITY" />
  <span class="stats-rule ascend-stats-rule" aria-hidden="true" />
  <WeaponScreenAscendMaterials :costs="costs" :game-text="gameText" />
</template>

<style scoped>
.divider {
  position: absolute;
  left: calc(var(--reference-pixel) * 1086);
  width: calc(var(--reference-pixel) * 738);
}

.ascend-divider {
  top: calc(var(--reference-pixel) * 190);
}

/* The rule between two stat rows: a faint hairline with a small star at its middle, which the game sets instead of a divider's ends */
.stats-rule {
  position: absolute;
  left: calc(var(--reference-pixel) * 1100);
  width: calc(var(--reference-pixel) * 705);
  height: calc(var(--reference-pixel) * 1);
  background: rgb(200 196 225 / 0.22);
}

.stats-rule::before {
  position: absolute;
  top: calc(var(--reference-pixel) * -4);
  left: calc(50% - var(--reference-pixel) * 4);
  width: calc(var(--reference-pixel) * 9);
  height: calc(var(--reference-pixel) * 9);
  background: rgb(200 196 225 / 0.4);
  clip-path: var(--sparkle-clip-path);
  content: "";
}

.ascend-stats-rule {
  top: calc(var(--reference-pixel) * 285);
}

.stat {
  position: absolute;
  margin: 0;
  color: #efe9f9;
  font-weight: 600;
  line-height: 1;
}

/* Ascend's stat names sit lower, under its level pair, at the sizes their words set */
.ascend-base-attack {
  top: calc(var(--reference-pixel) * 231);
  left: calc(var(--reference-pixel) * 1130);
  font-size: calc(var(--reference-pixel) * 33);
}

.ascend-attack {
  top: calc(var(--reference-pixel) * 305);
  left: calc(var(--reference-pixel) * 1128);
  font-size: calc(var(--reference-pixel) * 28);
}

.level-current,
.level-next {
  position: absolute;
  top: calc(var(--reference-pixel) * 158);
  margin: 0;
  font-size: calc(var(--reference-pixel) * 31);
  font-weight: 600;
  line-height: 1;
}

.level-current {
  left: calc(var(--reference-pixel) * 1237);
  color: #f5f0fb;
}

.level-next {
  left: calc(var(--reference-pixel) * 1546);
  color: #f5f0fb;
}

/* The "Lv." word sits dimmer than its numbers, and the cap the next phase reaches is the game's gold */
.level-word {
  color: #bdb4cd;
}

.next-max {
  color: #f5c33b;
}

/* The arrow between the two levels, the grey shaft and head the base ATK's arrow has */
.level-arrow {
  top: calc(var(--reference-pixel) * 155);
  left: calc(var(--reference-pixel) * 1437);
  width: calc(var(--reference-pixel) * 33);
}

/* The stat values the rows read at their right: Ascend's two base ATKs either side of its arrow, and its secondary */
.stat-value {
  position: absolute;
  width: calc(var(--reference-pixel) * 100);
  margin: 0;
  color: #efe9f9;
  font-weight: 600;
  line-height: 1;
  text-align: right;
}

.base-current,
.base-next {
  top: calc(var(--reference-pixel) * 231);
  font-size: calc(var(--reference-pixel) * 33);
}

.base-current {
  left: calc(var(--reference-pixel) * 1376);
}

.base-next {
  left: calc(var(--reference-pixel) * 1698);
}

.attack-current {
  top: calc(var(--reference-pixel) * 305);
  left: calc(var(--reference-pixel) * 1698);
  font-size: calc(var(--reference-pixel) * 28);
}

/* Ascend's arrow between the two base ATKs: a grey shaft with its head */
.arrow {
  position: absolute;
  top: calc(var(--reference-pixel) * 243);
  left: calc(var(--reference-pixel) * 1580);
  width: calc(var(--reference-pixel) * 26);
  height: calc(var(--reference-pixel) * 3);
  background: #6b6479;
}

.arrow::after {
  position: absolute;
  top: calc(var(--reference-pixel) * -4);
  right: 0;
  border-top: calc(var(--reference-pixel) * 5.5) solid transparent;
  border-bottom: calc(var(--reference-pixel) * 5.5) solid transparent;
  border-left: calc(var(--reference-pixel) * 9) solid #6b6479;
  content: "";
}

/* The marks before the stat names: a sparkle before Base ATK and a dot before the percentage */
.ascend-base-attack::before {
  position: absolute;
  top: calc(var(--reference-pixel) * 2);
  left: calc(var(--reference-pixel) * -33);
  width: calc(var(--reference-pixel) * 23);
  height: calc(var(--reference-pixel) * 23);
  background: #d9d3ea;
  clip-path: var(--sparkle-clip-path);
  content: "";
}

.ascend-attack::before {
  position: absolute;
  top: calc(var(--reference-pixel) * 6);
  left: calc(var(--reference-pixel) * -24);
  width: calc(var(--reference-pixel) * 9);
  height: calc(var(--reference-pixel) * 9);
  border-radius: 50%;
  background: #aaa3bd;
  content: "";
}
</style>
