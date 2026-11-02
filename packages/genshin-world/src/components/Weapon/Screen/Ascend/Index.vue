<script setup lang="ts">
import type { Weapon } from "#src/models/weapon/Weapon";
import type { WeaponAscendCost } from "#src/models/weapon/WeaponAscendCost";
import type { GameText } from "genshin-text";

import WeaponScreenAscendMaterials from "#src/components/Weapon/Screen/Ascend/Materials/Index.vue";
import WeaponScreenAscendSparks from "#src/components/Weapon/Screen/Ascend/Sparks/Index.vue";
import { DIVIDER_OPACITY } from "#src/services/weapon/constants";
import { OrnamentDivider } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The base ATK at the held phase, which the row beside the header sets against the next phase's
  baseAttackText: string;
  // The next phase's materials, handed on to the materials cards
  costs: WeaponAscendCost[];
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
  <p class="stat stat-sparkle ascend-base-attack">{{ gameText[GameTextKey.AttributeBaseAttack] }}</p>
  <p class="stat-value base-current">{{ baseAttackText }}</p>
  <span class="arrow" aria-hidden="true" />
  <p class="stat-value base-next">{{ nextBaseAttackText }}</p>
  <p class="stat stat-dot ascend-attack">{{ secondaryLabel }}</p>
  <p class="stat-value attack-current">{{ secondaryText }}</p>
  <OrnamentDivider class="divider ascend-divider" :opacity="DIVIDER_OPACITY" is-middle-hidden />
  <span class="stats-rule ascend-stats-rule" aria-hidden="true" />
  <WeaponScreenAscendMaterials :costs :game-text />
</template>

<style scoped src="../../../../styles/weaponScreen.css"></style>

<style scoped>
.ascend-divider {
  top: calc(var(--reference-pixel) * 190);
}

.ascend-stats-rule {
  top: calc(var(--reference-pixel) * 285);
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

/* The arrow between the two levels, the grey shaft and head the base ATK's arrow has. It must follow .arrow, which at the
   same specificity would otherwise win its top, left and width */
.level-arrow {
  top: calc(var(--reference-pixel) * 155);
  left: calc(var(--reference-pixel) * 1437);
  width: calc(var(--reference-pixel) * 33);
}

.ascend-attack::before {
  top: calc(var(--reference-pixel) * 6);
}
</style>
