<script setup lang="ts">
import { ASCENSION_PHASE_COUNT } from "#src/services/constants";

interface Props {
  // The weapon's ascension phase, from none to the last one
  ascension: number;
  // The weapon's base ATK at its level and phase, whole
  baseAttack: number;
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
}

const { ascension, baseAttack, levelText, name, rarity, refinement, subStatValue } = defineProps<Props>();
</script>

<template>
  <!-- The Weapons tab's panel: the weapon's name and stars, its base ATK and secondary attribute, its level with the
       ascension phases reached, its refinement rank, and the two buttons beneath -->
  <div class="weapons">
    <p class="name">{{ name }}</p>
    <p class="stars">
      <span v-for="star in rarity" :key="star" class="star" />
    </p>
    <ul class="stats">
      <li class="stat">{{ baseAttack }}</li>
      <li class="stat">{{ subStatValue }}</li>
    </ul>
    <p class="level">
      <span class="level-text">{{ levelText }}</span>
      <span v-for="phase in ASCENSION_PHASE_COUNT" :key="phase" class="spark" :class="{ lit: phase <= ascension }" />
    </p>
    <p class="refinement">{{ refinement }}</p>
    <div class="buttons">
      <span class="button" />
      <span class="button" />
    </div>
  </div>
</template>

<style scoped>
/* Measured off the English PC client's Weapons tab at 21:9 (references/character-weapons.png, 156 seconds), in units
   from the panel's top: a pixel of that frame at 1440 high is 0.75 units. The name's line sits 15 units down, the two
   stat rows at 101 and 135, the stars at 206, the level at 244, the refinement at 289 and the buttons at 859. Their
   colours are provisional, sampled off the frame's darker panel glass */
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

.stars {
  position: absolute;
  top: calc(var(--unit) * 206);
  left: 0;
  display: flex;
  margin: 0;
  gap: calc(var(--unit) * 4);
}

.star {
  width: calc(var(--unit) * 20);
  height: calc(var(--unit) * 20);
  background: #f5c542;
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%, 50% 0%);
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

/* Each row is a translucent band its value sits at the right of, on the game's 34-unit pitch */
.stat {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: calc(var(--unit) * 27);
  margin-bottom: calc(var(--unit) * 7);
  padding: 0 calc(var(--unit) * 16);
  border-radius: calc(var(--unit) * 4);
  background: rgb(0 0 0 / 0.2);
  font-size: calc(var(--unit) * 26);
  font-weight: 600;
}

.level {
  position: absolute;
  top: calc(var(--unit) * 244);
  right: 0;
  left: 0;
  display: flex;
  align-items: center;
  margin: 0;
  gap: calc(var(--unit) * 6);
  font-size: calc(var(--unit) * 24);
  font-weight: 600;
}

.level-text {
  padding: 0 calc(var(--unit) * 8);
  border-radius: calc(var(--unit) * 4);
  background: rgb(0 0 0 / 0.45);
}

/* The six ascension phases, each a small star the phases reached light */
.spark {
  width: calc(var(--unit) * 14);
  height: calc(var(--unit) * 14);
  background: rgb(255 255 255 / 0.3);
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%, 50% 0%);
}

.spark.lit {
  background: #fff;
}

.refinement {
  position: absolute;
  top: calc(var(--unit) * 289);
  right: 0;
  left: 0;
  margin: 0;
  color: #f0d27a;
  font-size: calc(var(--unit) * 26);
  font-weight: 600;
  line-height: calc(var(--unit) * 19);
}

/* The two buttons, the game's pills, each the panel's half less the gap between them */
.buttons {
  position: absolute;
  top: calc(var(--unit) * 859);
  right: 0;
  left: 0;
  display: flex;
  gap: calc(var(--unit) * 23);
}

.button {
  flex: 1;
  height: calc(var(--unit) * 52);
  border-radius: calc(var(--unit) * 26);
  background: rgb(236 229 216 / 0.85);
}
</style>
