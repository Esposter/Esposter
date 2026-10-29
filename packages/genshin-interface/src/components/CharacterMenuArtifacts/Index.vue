<script setup lang="ts">
import type { ArtifactSetBonusGroup } from "#src/models/ArtifactSetBonusGroup";
import type { ArtifactSlotStats } from "#src/models/ArtifactSlotStats";
import type { ArtifactStatLine } from "#src/models/ArtifactStatLine";

import CharacterMenuButtons from "#src/components/CharacterMenuButtons/Index.vue";
import GameButton from "#src/components/GameButton/Index.vue";
import ToastNotice from "#src/components/ToastNotice/Index.vue";
import { GameButtonKind } from "#src/models/GameButtonKind";
import { computed, ref } from "vue";

interface Props {
  // The pill that opens the picked piece's stats and its actions in place of the totals and the set bonus
  artifactDetailsLabel: string;
  // The picked piece's Enhance button label, the game's word for raising a worn artifact's level with its EXP
  enhanceLabel: string;
  // Per slot, whether Fast Equip is disabled there, which it is while no artifact in the bag can be put on that slot
  equipDisabledSlots: boolean[];
  // The picked slot's Equip button label, shown in the details while the slot is empty
  equipLabel: string;
  // The Fast Equip button's label, which puts a bag artifact on the picked slot
  fastEquipLabel: string;
  // The Lock button's label, shown in the details while the picked worn artifact is unlocked
  lockLabel: string;
  // The words the set bonus block shows while no bonus is active
  noSetBonusLabel: string;
  // The game's notice card shown over the panel while an action was refused, such as a full bag, empty while none is
  notice: string;
  // The set bonus block's heading, the game's word for its bonuses
  setBonusHeading: string;
  // Each set the worn artifacts make, its name and its bonuses' lines in the game's words, empty while none is active
  sets: ArtifactSetBonusGroup[];
  // Each slot's name in the game's order, which the details name the picked slot by
  slotNames: string[];
  // Each slot's stats in the game's order, undefined where the character wears no artifact, shown in the details
  slotStats: (ArtifactSlotStats | undefined)[];
  // The Switch button's label, which moves the picked slot on to the next one
  switchLabel: string;
  // The attribute totals the worn artifacts add, each as the game writes it
  totals: ArtifactStatLine[];
  // The Unequip button's label, shown in the details while the picked slot holds a worn artifact
  unequipLabel: string;
  // The Unlock button's label, shown in the details while the picked worn artifact is locked
  unlockLabel: string;
}

const {
  artifactDetailsLabel,
  enhanceLabel,
  equipDisabledSlots,
  equipLabel,
  fastEquipLabel,
  lockLabel,
  noSetBonusLabel,
  notice,
  setBonusHeading,
  sets,
  slotNames,
  slotStats,
  switchLabel,
  totals,
  unequipLabel,
  unlockLabel,
} = defineProps<Props>();
// Each action names the slot it is taken on by its index
const emit = defineEmits<{
  enhance: [index: number];
  equip: [index: number];
  lock: [index: number];
  unequip: [index: number];
}>();
// The slot the actions are for, the first until Switch moves it on, and whether the details are open in place of the totals
const selectedIndex = ref(0);
const isDetailsOpen = ref(false);
const selectedStats = computed(() => slotStats[selectedIndex.value]);
const isSelectedWorn = computed(() => selectedStats.value !== undefined);
const switchSlot = () => {
  selectedIndex.value = (selectedIndex.value + 1) % slotNames.length;
};
</script>

<template>
  <!-- The Artifacts tab's panel: the worn artifacts' attribute totals down its top, the set bonus block under them, and the
       Fast Equip and Switch buttons at its foot. Pressing Artifact Details opens the picked slot's stats in place of the totals,
       with its Enhance, Equip or Unequip and Lock buttons at the foot in place of those two -->
  <div class="artifacts">
    <ToastNotice v-if="notice" class="notice">{{ notice }}</ToastNotice>
    <button class="details" :aria-expanded="isDetailsOpen" type="button" @click="isDetailsOpen = !isDetailsOpen">
      {{ artifactDetailsLabel }}
    </button>
    <template v-if="isDetailsOpen">
      <p class="slot-name">{{ slotNames[selectedIndex] }}</p>
      <ul v-if="selectedStats" class="stats">
        <li class="stat">
          <span>{{ selectedStats.mainStat.label }}</span>
          <span>{{ selectedStats.mainStat.value }}</span>
        </li>
        <li v-for="({ label, value }, index) in selectedStats.subStats" :key="index" class="stat">
          <span>{{ label }}</span>
          <span>{{ value }}</span>
        </li>
      </ul>
    </template>
    <template v-else>
      <ul class="totals">
        <li v-for="{ label, value } in totals" :key="label" class="total">
          <span>{{ label }}</span>
          <span>{{ value }}</span>
        </li>
      </ul>
      <div class="set-bonus">
        <p class="set-bonus-heading">{{ setBonusHeading }}</p>
        <template v-if="sets.length > 0">
          <div v-for="({ lines, name }, index) in sets" :key="index">
            <p v-if="name" class="set-name">{{ name }}</p>
            <ul class="set-bonus-lines">
              <li v-for="line in lines" :key="line">
                <svg class="check" viewBox="0 0 20 20" aria-hidden="true">
                  <circle cx="10" cy="10" r="10" />
                  <path d="M5.5 10.5 L8.5 13.5 L14.5 7" />
                </svg>
                {{ line }}
              </li>
            </ul>
          </div>
        </template>
        <p v-else class="set-bonus-lines">{{ noSetBonusLabel }}</p>
      </div>
    </template>
    <CharacterMenuButtons>
      <template v-if="isDetailsOpen">
        <GameButton
          class="button"
          :disabled="!isSelectedWorn"
          :kind="GameButtonKind.Pill"
          tip=""
          @click="emit('enhance', selectedIndex)"
        >
          {{ enhanceLabel }}
        </GameButton>
        <GameButton
          class="button"
          :disabled="!isSelectedWorn && equipDisabledSlots[selectedIndex]"
          :kind="GameButtonKind.Pill"
          tip=""
          @click="isSelectedWorn ? emit('unequip', selectedIndex) : emit('equip', selectedIndex)"
        >
          {{ isSelectedWorn ? unequipLabel : equipLabel }}
        </GameButton>
        <GameButton
          v-if="selectedStats"
          class="button"
          :kind="GameButtonKind.Pill"
          tip=""
          @click="emit('lock', selectedIndex)"
        >
          {{ selectedStats.isLocked ? unlockLabel : lockLabel }}
        </GameButton>
      </template>
      <template v-else>
        <GameButton
          class="button"
          :disabled="equipDisabledSlots[selectedIndex]"
          :kind="GameButtonKind.Pill"
          tip=""
          @click="emit('equip', selectedIndex)"
        >
          <span class="key" aria-hidden="true">R</span>
          {{ fastEquipLabel }}
        </GameButton>
        <GameButton class="button" :kind="GameButtonKind.Pill" tip="" @click="switchSlot()">
          <span class="key" aria-hidden="true">F</span>
          {{ switchLabel }}
        </GameButton>
      </template>
    </CharacterMenuButtons>
  </div>
</template>

<style scoped>
/* Measured off the English PC client's Artifacts tab at 21:9, its settled frame at 157.5 seconds of session-2.mp4 (the
   registered reference for it), in units from the panel's top-left: the Artifact Details pill at 164 units down and 326 wide,
   the totals' rows 35.6 apart from 0.7 down, the set bonus block from 222 down, its check discs 19.5 across, and the foot's
   pills at 859 down, 155.6 wide and 49 high with their key badges 19.9 across at their foot's left. The panel's left edge
   is the reference's, so the heading and the first pill sit 3 units off it (clipped by the panel), and the set bonus's
   scrollbar lies past the panel's right edge (clipped too). Colours are provisional */
.artifacts {
  position: absolute;
  inset: 0;
  color: #fff;
}

.notice {
  position: absolute;
  top: calc(var(--unit) * 100);
  right: 0;
  left: 0;
}

.details {
  position: absolute;
  top: calc(var(--unit) * 164);
  left: calc(var(--unit) * 1.5);
  width: calc(var(--unit) * 326);
  height: calc(var(--unit) * 38);
  padding: 0;
  border: none;
  border-radius: calc(var(--unit) * 19);
  background: rgb(255 255 255 / 0.07);
  color: #fff;
  cursor: pointer;
  font: inherit;
  font-size: calc(var(--unit) * 24);
  font-weight: 500;
}

.totals,
.stats {
  position: absolute;
  top: calc(var(--unit) * 0.7);
  right: 0;
  left: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}

.stats {
  top: calc(var(--unit) * 250);
}

.total,
.stat {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: calc(var(--unit) * 35.6);
  padding: 0 calc(var(--unit) * 2) 0 calc(var(--unit) * 28);
  font-size: calc(var(--unit) * 26);
  font-weight: 600;
}

.slot-name {
  position: absolute;
  top: calc(var(--unit) * 212);
  right: 0;
  left: 0;
  margin: 0;
  padding: 0 calc(var(--unit) * 28);
  color: #fff;
  font-size: calc(var(--unit) * 26);
  font-weight: 600;
  line-height: calc(var(--unit) * 30);
}

/* The block ends 88 units above the panel's foot, where the game's text is cut off under the pills */
.set-bonus {
  position: absolute;
  top: calc(var(--unit) * 222.4);
  right: calc(var(--unit) * 16);
  bottom: calc(var(--unit) * 88);
  left: 0;
  overflow: hidden;
  color: #a8ff8e;
}

.set-bonus-heading,
.set-name,
.set-bonus-lines {
  margin: 0;
  padding: 0;
  list-style: none;
}

/* The face is Signika, narrower than the game's at the same cap height, so each line is spaced out to the game's width */
.set-bonus-heading {
  font-size: calc(var(--unit) * 26);
  font-weight: 600;
  letter-spacing: calc(var(--unit) * 1.1);
  line-height: calc(var(--unit) * 30);
}

.set-name {
  margin-top: calc(var(--unit) * 14.1);
  font-size: calc(var(--unit) * 27);
  font-weight: 600;
  letter-spacing: calc(var(--unit) * 1.3);
  line-height: calc(var(--unit) * 28.9);
}

.set-bonus-lines {
  margin-top: calc(var(--unit) * 1.9);
  font-size: calc(var(--unit) * 23.5);
  letter-spacing: calc(var(--unit) * 0.66);
  line-height: calc(var(--unit) * 24.4);
}

.set-bonus-lines li {
  position: relative;
  padding-left: calc(var(--unit) * 21.4);
}

.check {
  position: absolute;
  top: calc(var(--unit) * 2.4);
  left: 0;
  width: calc(var(--unit) * 19.5);
  height: calc(var(--unit) * 19.5);
}

.check circle {
  fill: #61bf55;
}

.check path {
  fill: none;
  stroke: #fff;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2.2;
}

.button {
  position: relative;
  display: grid;
  flex: 1;
  height: calc(var(--unit) * 49);
  place-items: center;
  font-size: calc(var(--unit) * 27);
  font-weight: 600;
}

.key {
  position: absolute;
  bottom: 0;
  left: 0;
  width: calc(var(--unit) * 19.9);
  height: calc(var(--unit) * 18.75);
  border-radius: calc(var(--unit) * 4);
  background: #f2f0ec;
  color: #373536;
  font-size: calc(var(--unit) * 15);
  font-weight: 600;
  line-height: calc(var(--unit) * 18.75);
  text-align: center;
}
</style>
