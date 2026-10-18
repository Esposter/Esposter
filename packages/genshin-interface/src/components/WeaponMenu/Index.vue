<script setup lang="ts">
import type { WeaponMenuTab } from "#src/models/WeaponMenuTab";

import { ASCENSION_PHASE_COUNT } from "#src/services/constants";

interface Props {
  // The action the panel's button takes, in the game's words for the open tab
  actionLabel: string;
  // The weapon's ascension phase, from none to the last one
  ascension: number;
  // The way back's name for assistive tech, the game's "Back" line
  closeLabel: string;
  // The share of the EXP towards the next level the bar fills, from none to whole, none at the level cap
  experienceRatio: number;
  // The EXP the weapon holds towards the next level over what that level takes, or nothing at the level cap
  experienceText: string;
  // Whether the open tab's action is refused now, its button disabled
  isActionDisabled: boolean;
  // The weapon's level over its phase's cap, as the reader's language writes it
  levelText: string;
  // The weapon's name in the reader's language
  name: string;
  // The weapon's rarity in stars
  rarity: number;
  // The weapon's refinement rank, from one to five
  refinement: number;
  // The tabs offered, in the game's order, each with its label in the reader's language
  tabs: { label: string; tab: WeaponMenuTab }[];
}

defineSlots<{ default: () => unknown }>();
const tab = defineModel<WeaponMenuTab>("tab", { required: true });
const { ascension, experienceRatio, levelText, name, rarity, refinement, tabs } = defineProps<Props>();
const emit = defineEmits<{ action: []; close: [] }>();
</script>

<template>
  <!-- The weapon screen's frame: the weapon's name at the top left, the tabs down the left with the open one lit, and the
       open tab's panel down the right with its level, EXP, phase and refinement above it and its action beneath -->
  <div class="weapon-menu" :data-tab="tab">
    <p class="breadcrumb">{{ name }}</p>
    <ul class="tabs">
      <li v-for="menuTab of tabs" :key="menuTab.tab">
        <button class="tab" :aria-pressed="menuTab.tab === tab" type="button" @click="tab = menuTab.tab">
          {{ menuTab.label }}
        </button>
      </li>
    </ul>
    <p class="stars" :aria-label="`${rarity}`">
      <span v-for="star in rarity" :key="star" class="star" />
    </p>
    <p class="refinement">{{ refinement }}</p>
    <p class="level">
      <span class="level-text">{{ levelText }}</span>
      <span class="sparks">
        <!-- The ascension phases, each a small star the phases reached light -->
        <span v-for="phase in ASCENSION_PHASE_COUNT" :key="phase" class="spark" :class="{ lit: phase <= ascension }" />
      </span>
    </p>
    <p class="experience-text">{{ experienceText }}</p>
    <span class="experience"><span class="fill" :style="{ '--experience-ratio': experienceRatio }" /></span>
    <section class="panel" :aria-label="actionLabel"><slot /></section>
    <button class="action" :disabled="isActionDisabled" type="button" @click="emit('action')">{{ actionLabel }}</button>
    <button class="close" :aria-label="closeLabel" type="button" @click="emit('close')">↶</button>
  </div>
</template>

<style scoped>
/* Measured off the English PC client's weapon screen in the 7.1 Silver Light clip (captures/weapon-enhance-jXrYcFHiVnI.mp4,
   frame at 2 seconds, Enhance tab at level 1, and frame at 92 seconds, Refine tab), at 1920 by 864 pixels, in units of the
   1080-high frame: a pixel there is 1.25 units. The name's line sits 60 units down, the tabs' lit row at 280, the level at
   164, the EXP bar at 235, the materials' panel from 600, the action at 965 and the way back at 25. Their colours are
   provisional, sampled by eye off the frame's violet glass */
.weapon-menu {
  position: absolute;
  inset: 0;
  color: #fff;
}

.breadcrumb {
  position: absolute;
  top: calc(var(--unit) * 40);
  left: calc(var(--unit) * 269);
  margin: 0;
  color: #e8d9a6;
  font-size: calc(var(--unit) * 30);
  font-weight: 600;
  line-height: calc(var(--unit) * 40);
}

.tabs {
  position: absolute;
  top: calc(var(--unit) * 245);
  left: calc(var(--unit) * 170);
  margin: 0;
  padding: 0;
  list-style: none;
}

/* Each tab is a row of the game's menu, its label in cream and the open one in white, on the game's 87.5-unit pitch */
.tab {
  display: block;
  width: calc(var(--unit) * 300);
  height: calc(var(--unit) * 70);
  padding: 0;
  border: none;
  background: none;
  color: rgb(236 229 216 / 0.7);
  cursor: inherit;
  font: inherit;
  font-size: calc(var(--unit) * 42);
  font-weight: 600;
  text-align: left;
}

.tab[aria-pressed="true"] {
  color: #fff;
}

.stars {
  position: absolute;
  top: calc(var(--unit) * 100);
  left: calc(var(--unit) * 1380);
  display: flex;
  margin: 0;
  gap: calc(var(--unit) * 4);
}

.star {
  width: calc(var(--unit) * 22);
  height: calc(var(--unit) * 22);
  background: #f5c542;
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%, 50% 0%);
}

/* The refinement rank sits at the panel's right, as a gold figure in its own pill */
.refinement {
  position: absolute;
  top: calc(var(--unit) * 100);
  right: calc(var(--unit) * 30);
  margin: 0;
  padding: 0 calc(var(--unit) * 14);
  border-radius: calc(var(--unit) * 4);
  background: rgb(0 0 0 / 0.35);
  color: #f0d27a;
  font-size: calc(var(--unit) * 30);
  font-weight: 600;
  line-height: calc(var(--unit) * 36);
}

.level {
  position: absolute;
  top: calc(var(--unit) * 140);
  left: calc(var(--unit) * 1380);
  display: flex;
  align-items: center;
  margin: 0;
  gap: calc(var(--unit) * 14);
}

.level-text {
  font-size: calc(var(--unit) * 50);
  font-weight: 600;
  line-height: calc(var(--unit) * 60);
  text-shadow: 0 calc(var(--unit) * 1) calc(var(--unit) * 3) rgb(0 0 0 / 0.4);
}

.sparks {
  display: flex;
  gap: calc(var(--unit) * 6);
}

.spark {
  width: calc(var(--unit) * 14);
  height: calc(var(--unit) * 14);
  background: rgb(255 255 255 / 0.3);
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%, 50% 0%);
}

.spark.lit {
  background: #fff;
}

.experience-text {
  position: absolute;
  top: calc(var(--unit) * 150);
  right: calc(var(--unit) * 30);
  margin: 0;
  color: #d9c8ff;
  font-size: calc(var(--unit) * 34);
  font-weight: 600;
  line-height: calc(var(--unit) * 44);
}

/* The EXP bar, a thin track across the panel with its fill to the share of the next level held */
.experience {
  position: absolute;
  top: calc(var(--unit) * 233);
  left: calc(var(--unit) * 1365);
  width: calc(var(--unit) * 910);
  height: calc(var(--unit) * 4);
  background: rgb(255 255 255 / 0.2);
}

.fill {
  display: block;
  width: calc(var(--experience-ratio) * 100%);
  height: 100%;
  background: #f5c542;
}

.panel {
  position: absolute;
  top: calc(var(--unit) * 600);
  left: calc(var(--unit) * 1380);
  width: calc(var(--unit) * 870);
  height: calc(var(--unit) * 330);
}

/* The action is the game's wide button at the panel's foot, its label in gold on a cream rectangle */
.action {
  position: absolute;
  top: calc(var(--unit) * 965);
  left: calc(var(--unit) * 1890);
  width: calc(var(--unit) * 360);
  height: calc(var(--unit) * 79);
  border: none;
  border-radius: calc(var(--unit) * 6);
  background: #ece5d8;
  color: #3b4255;
  cursor: inherit;
  font: inherit;
  font-size: calc(var(--unit) * 36);
  font-weight: 600;
}

.action:disabled {
  background: rgb(236 229 216 / 0.35);
  color: rgb(59 66 85 / 0.6);
}

/* The way back at the top right, the game's round return control */
.close {
  position: absolute;
  top: calc(var(--unit) * 25);
  left: calc(var(--unit) * 2177);
  width: calc(var(--unit) * 72);
  height: calc(var(--unit) * 69);
  border: none;
  border-radius: 50%;
  background: rgb(0 0 0 / 0.3);
  color: #fff;
  cursor: inherit;
  font: inherit;
  font-size: calc(var(--unit) * 40);
  line-height: 1;
}
</style>
