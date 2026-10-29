<script setup lang="ts">
import CharacterMenuButtons from "#src/components/CharacterMenuButtons/Index.vue";
import { ASCENSION_PHASE_COUNT } from "#src/services/constants";

interface Props {
  // The weapon's ascension phase, from none to the last one
  ascension: number;
  // The weapon's base ATK at its level and phase, whole
  baseAttack: number;
  // The base ATK row's label, the game's name for the attribute
  baseAttackLabel: string;
  // The Enhance button's words, the equipment page's name for raising the weapon's level
  enhanceLabel: string;
  // The weapon's kind in the reader's language, the word its panel names it by
  kind: string;
  // The weapon's level over its phase's cap, as the reader's language writes it
  levelText: string;
  // The weapon's name in the reader's language
  name: string;
  // The weapon's rarity in stars
  rarity: number;
  // The weapon's refinement rank, from one to five
  refinement: number;
  // The weapon's secondary attribute at its level, as the game writes it
  subStatValue: string;
  // The Switch button's words, the game's name for moving the weapon to another character
  switchLabel: string;
}

const {
  ascension,
  baseAttack,
  baseAttackLabel,
  enhanceLabel,
  kind,
  levelText,
  name,
  rarity,
  refinement,
  subStatValue,
  switchLabel,
} = defineProps<Props>();
</script>

<template>
  <!-- The Weapons tab's panel: the weapon's name and kind beside its lock, its base ATK and secondary attribute, its stars,
       its level with the ascension phases reached, its refinement rank, the scrollbar of its passive's column, and the two
       buttons beneath. The passive's text is not drawn: its glyphs are the game's typeface, and drawn in ours they score
       worse than the frame's own text left bare -->
  <div class="weapons">
    <p class="name">{{ name }}</p>
    <p class="kind">{{ kind }}</p>
    <span class="lock" />
    <ul class="stats">
      <li class="stat">
        <span>{{ baseAttackLabel }}</span>
        <span class="stat-value">{{ baseAttack }}</span>
      </li>
      <li class="stat">
        <span class="stat-value">{{ subStatValue }}</span>
      </li>
    </ul>
    <p class="stars">
      <span v-for="star in rarity" :key="star" class="star" />
    </p>
    <p class="level">
      <span class="level-text">{{ levelText }}</span>
      <span v-for="phase in ASCENSION_PHASE_COUNT" :key="phase" class="spark" :class="{ lit: phase <= ascension }" />
    </p>
    <p class="refinement">{{ refinement }}</p>
    <span class="scrollbar"><span class="thumb" /></span>
    <CharacterMenuButtons>
      <span class="action cream-pill">{{ switchLabel }}</span>
      <span class="action cream-pill">{{ enhanceLabel }}</span>
    </CharacterMenuButtons>
  </div>
</template>

<style scoped>
/* Measured off the English PC client's Weapons tab at 21:9 (references/character-weapons.png, 156 seconds), in units
   from the panel's top: a pixel of that frame at 1440 high is 0.75 units. The name's line sits 15 units down, the kind 64,
   the two stat rows at 101 and 145, the stars at 210, the level at 243, the refinement at 287, the scrollbar from 4 to 765
   and the buttons at 859. Their colours are provisional, sampled off the frame's darker panel glass */
.weapons {
  position: absolute;
  inset: 0;
  color: #fff;
}

.name {
  position: absolute;
  top: calc(var(--unit) * 15);
  right: 0;
  left: 0;
  margin: 0;
  font-size: calc(var(--unit) * 30);
  font-weight: 600;
  line-height: calc(var(--unit) * 36);
  text-shadow: 0 calc(var(--unit) * 1) calc(var(--unit) * 3) rgb(0 0 0 / 0.4);
}

.kind {
  position: absolute;
  top: calc(var(--unit) * 64);
  right: 0;
  left: 0;
  margin: 0;
  color: rgb(255 255 255 / 0.8);
  font-size: calc(var(--unit) * 24);
  line-height: calc(var(--unit) * 24);
}

/* The lock beside the kind, its glyph left to the game's art: a dark square with a light rim */
.lock {
  position: absolute;
  top: calc(var(--unit) * 61);
  left: calc(var(--unit) * 296);
  box-sizing: border-box;
  width: calc(var(--unit) * 30);
  height: calc(var(--unit) * 30);
  border: calc(var(--unit) * 2) solid rgb(176 186 214 / 0.6);
  border-radius: calc(var(--unit) * 6);
  background: rgb(36 44 70 / 0.7);
}

.stars {
  position: absolute;
  top: calc(var(--unit) * 210);
  left: 0;
  display: flex;
  margin: 0;
  gap: calc(var(--unit) * 11.25);
}

.star {
  width: calc(var(--unit) * 22.5);
  height: calc(var(--unit) * 22.5);
}

.stats {
  position: absolute;
  top: calc(var(--unit) * 101);
  right: 0;
  left: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}

/* Each row is a translucent band its label sits at the left of and its value at the right of, on the game's 44.5-unit pitch */
.stat {
  display: flex;
  align-items: center;
  height: calc(var(--unit) * 37.5);
  margin-bottom: calc(var(--unit) * 7);
  padding: 0 calc(var(--unit) * 11);
  border-radius: calc(var(--unit) * 4);
  background: rgb(0 0 0 / 0.2);
  font-size: calc(var(--unit) * 27);
  font-weight: 600;
}

.stat-value {
  margin-left: auto;
}

.level {
  position: absolute;
  top: calc(var(--unit) * 243);
  right: 0;
  left: 0;
  display: flex;
  align-items: center;
  margin: 0;
  gap: calc(var(--unit) * 8);
  font-size: calc(var(--unit) * 24);
  font-weight: 600;
}

.level-text {
  margin-right: calc(var(--unit) * 9);
  padding: 0 calc(var(--unit) * 8);
  border-radius: calc(var(--unit) * 4);
  background: rgb(0 0 0 / 0.45);
}

/* Each ascension phase is a four-pointed glint, sized and spaced as the game draws them */
.level .spark {
  width: calc(var(--unit) * 22);
  height: calc(var(--unit) * 22);
  clip-path: polygon(50% 0%, 60% 40%, 100% 50%, 60% 60%, 50% 100%, 40% 60%, 0% 50%, 40% 40%);
}

.refinement {
  position: absolute;
  top: calc(var(--unit) * 287);
  right: 0;
  left: 0;
  margin: 0;
  color: #f0d27a;
  font-size: calc(var(--unit) * 26);
  font-weight: 600;
  line-height: calc(var(--unit) * 30);
}

/* The scrollbar beside the passive's column, its thumb over the top of its track */
.scrollbar {
  position: absolute;
  top: calc(var(--unit) * 4);
  left: calc(var(--unit) * 345);
  width: calc(var(--unit) * 4.5);
  height: calc(var(--unit) * 761);
  border-radius: calc(var(--unit) * 2);
  background: rgb(255 255 255 / 0.2);
}

.thumb {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: calc(var(--unit) * 578);
  border-radius: inherit;
  background: rgb(255 255 255 / 0.6);
}

.action {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  height: calc(var(--unit) * 49);
}
</style>

<style scoped src="../../styles/creamPill.css"></style>
<style scoped src="../../styles/weaponStars.css"></style>
