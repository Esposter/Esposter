<script setup lang="ts">
import type { Weapon } from "#src/models/weapon/Weapon";
import type { GameText } from "genshin-text";

import WeaponScreenEnhanceControls from "#src/components/Weapon/Screen/Enhance/Controls/Index.vue";
import { DIVIDER_OPACITY, ENHANCE_MATERIAL_LIMIT } from "#src/services/weapon/constants";
import { OrnamentDivider } from "genshin-interface";
import { fillGameTextValues, GameTextKey } from "genshin-text";

interface Props {
  // The base ATK at the held phase, which the stat row beside the header reads
  baseAttackText: string;
  // The game's words in the reader's language
  gameText: GameText;
  // The level the weapon's phase caps at, which its EXP line stops at
  maxLevel: number;
  // The materials the Enhance panel holds picked, which its consumed line counts against the limit
  pickedMaterialCount: number;
  // The EXP the weapon needs to rise past its level, which its EXP line sets beside the EXP it holds
  requiredExp: number;
  // The secondary attribute's label, the game's name for it, a percentage under its flat attribute's name
  secondaryLabel: string;
  // The secondary attribute at the weapon's level, as the game writes it
  secondaryText: string;
  // The weapon whose level and EXP the header shows
  weapon: Weapon;
}

const { baseAttackText, gameText, maxLevel, pickedMaterialCount, requiredExp, secondaryLabel, secondaryText, weapon } =
  defineProps<Props>();
// The level Enhance's header shows alone; the Ascend header writes its own level pair over the cap of each phase
const levelText = computed(() => fillGameTextValues(gameText[GameTextKey.LevelFormat], `${weapon.level}`));
// The EXP the weapon holds towards the next level over what that level takes; a weapon at its cap has no next level
const experienceText = computed(() => (weapon.level >= maxLevel ? "" : `${weapon.experience}/${requiredExp}`));
const consumedText = computed(() =>
  fillGameTextValues(gameText[GameTextKey.WeaponEnhanceMaterialsConsumed], pickedMaterialCount, ENHANCE_MATERIAL_LIMIT),
);
</script>

<template>
  <p class="level">{{ levelText }}</p>
  <p class="exp-tag">{{ gameText[GameTextKey.WeaponExp] }}</p>
  <p class="experience-text">{{ experienceText }}</p>
  <span class="exp-track" aria-hidden="true" />
  <p class="consumed">{{ consumedText }}</p>
  <p class="stat stat-sparkle base-attack">{{ gameText[GameTextKey.AttributeBaseAttack] }}</p>
  <p class="stat-value base-attack-value">{{ baseAttackText }}</p>
  <p class="stat stat-dot attack">{{ secondaryLabel }}</p>
  <p class="stat-value attack-value">{{ secondaryText }}</p>
  <div class="divider enhance-divider"><OrnamentDivider :opacity="DIVIDER_OPACITY" is-middle-hidden /></div>
  <span class="stats-rule enhance-stats-rule" aria-hidden="true" />
  <WeaponScreenEnhanceControls :game-text="gameText" />
</template>

<style scoped src="../../../../styles/weaponScreen.css"></style>

<style scoped>
.enhance-divider {
  top: calc(var(--reference-pixel) * 180);
}

.enhance-stats-rule {
  top: calc(var(--reference-pixel) * 272);
}

/* Enhance's header: the level in white with its EXP at the right in lilac, and the two stats' names */
.level {
  position: absolute;
  top: calc(var(--reference-pixel) * 110);
  left: calc(var(--reference-pixel) * 1104);
  margin: 0;
  color: #f5effb;
  font-size: calc(var(--reference-pixel) * 43);
  font-weight: 600;
  line-height: 1;
}

/* The EXP tag under the level, set in the same white as the stat names */
.exp-tag {
  position: absolute;
  top: calc(var(--reference-pixel) * 157);
  left: calc(var(--reference-pixel) * 1102);
  margin: 0;
  color: #efe9f9;
  font-size: calc(var(--reference-pixel) * 16);
  font-weight: 600;
  line-height: 1;
}

.experience-text {
  position: absolute;
  top: calc(var(--reference-pixel) * 124);
  right: calc(var(--reference-pixel) * 122);
  margin: 0;
  color: #c9a2ee;
  font-size: calc(var(--reference-pixel) * 24);
  font-weight: 600;
  line-height: 1;
}

.base-attack {
  top: calc(var(--reference-pixel) * 218);
  left: calc(var(--reference-pixel) * 1130);
  font-size: calc(var(--reference-pixel) * 33);
}

.attack {
  top: calc(var(--reference-pixel) * 292);
  left: calc(var(--reference-pixel) * 1128);
  font-size: calc(var(--reference-pixel) * 29);
}

/* The consumed count the Enhance panel sets over its strip, centred like the words the game sets over its panels */
.consumed {
  position: absolute;
  top: calc(var(--reference-pixel) * 489);
  left: calc(var(--reference-pixel) * 1097);
  width: calc(var(--reference-pixel) * 706);
  margin: 0;
  color: #e9d29a;
  font-size: calc(var(--reference-pixel) * 25);
  font-weight: 600;
  letter-spacing: calc(var(--reference-pixel) * 1.9);
  line-height: 1;
  text-align: center;
}

.base-attack-value {
  top: calc(var(--reference-pixel) * 218);
  left: calc(var(--reference-pixel) * 1700);
  font-size: calc(var(--reference-pixel) * 33);
}

.attack-value {
  top: calc(var(--reference-pixel) * 292);
  left: calc(var(--reference-pixel) * 1700);
  font-size: calc(var(--reference-pixel) * 29);
}

/* The EXP track under the level: a hairline in the game's dark red */
.exp-track {
  position: absolute;
  top: calc(var(--reference-pixel) * 165);
  left: calc(var(--reference-pixel) * 1140);
  width: calc(var(--reference-pixel) * 655);
  height: calc(var(--reference-pixel) * 2);
  background: #482864;
}

.attack::before {
  top: calc(var(--reference-pixel) * 8);
}
</style>
