<script setup lang="ts">
import CharacterMenuButtons from "#src/components/CharacterMenuButtons/Index.vue";
import GameButton from "#src/components/GameButton/Index.vue";
import { GameButtonKind } from "#src/models/GameButtonKind";
import { computed, ref } from "vue";

// One line of an artifact's stats: the attribute's name in the game and its value
interface ArtifactStatLine {
  label: string;
  value: string;
}

// A worn artifact's stats: its main stat with its value, its minor affixes, and whether it is locked
interface ArtifactSlotStats {
  isLocked: boolean;
  mainStat: ArtifactStatLine;
  subStats: ArtifactStatLine[];
}

interface Props {
  // The Enhance button's label, the game's word for raising a worn artifact's level with its EXP
  enhanceLabel: string;
  // Per slot, whether Equip is disabled there, which it is while no artifact in the bag can be put on that slot
  equipDisabledSlots: boolean[];
  // The Equip button's label, shown while the picked slot is empty
  equipLabel: string;
  // The Lock button's label, shown while the picked worn artifact is unlocked
  lockLabel: string;
  // The words the set bonus block shows while no bonus is active
  noSetBonusLabel: string;
  // The set bonus block's heading, the game's word for its bonuses
  setBonusHeading: string;
  // Each bonus the worn artifacts' set grants, as its line in the game's words, empty while none is active
  setBonusLines: string[];
  // Each slot's name in the game's order, which its disc is labelled by and the details pill shows for the picked slot
  slotNames: string[];
  // Each slot's stats in the game's order, undefined where the character wears no artifact, which leaves its disc unlit
  slotStats: (ArtifactSlotStats | undefined)[];
  // The Unequip button's label, shown while the picked slot holds a worn artifact
  unequipLabel: string;
  // The Unlock button's label, shown while the picked worn artifact is locked
  unlockLabel: string;
}

const {
  enhanceLabel,
  equipDisabledSlots,
  equipLabel,
  lockLabel,
  noSetBonusLabel,
  setBonusHeading,
  setBonusLines,
  slotNames,
  slotStats,
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
// The slot the details, stats and buttons are for, the first until a disc is picked
const selectedIndex = ref(0);
const selectedStats = computed(() => slotStats[selectedIndex.value]);
const isSelectedWorn = computed(() => selectedStats.value !== undefined);
</script>

<template>
  <!-- The Artifacts tab's panel: the five slots down its top, each a disc lit where the character wears an artifact and
       picked by a click, the picked slot's name in the details pill, the picked artifact's main and sub stats under it,
       the set bonus block below them, and the Enhance and Equip or Unequip buttons at its foot. The stats' place is
       provisional -->
  <div class="artifacts">
    <ul class="slots">
      <li v-for="(stats, index) in slotStats" :key="index">
        <button
          class="slot"
          :aria-label="slotNames[index]"
          :aria-pressed="index === selectedIndex"
          :class="{ worn: stats !== undefined }"
          type="button"
          @click="selectedIndex = index"
        />
      </li>
    </ul>
    <div class="details">{{ slotNames[selectedIndex] }}</div>
    <ul v-if="selectedStats" class="stats">
      <li class="stat">
        <span>{{ selectedStats.mainStat.label }}</span>
        <span>{{ selectedStats.mainStat.value }}</span>
      </li>
      <li v-for="(subStat, index) in selectedStats.subStats" :key="index" class="stat">
        <span>{{ subStat.label }}</span>
        <span>{{ subStat.value }}</span>
      </li>
    </ul>
    <div class="set-bonus">
      <p class="set-bonus-heading">{{ setBonusHeading }}</p>
      <ul v-if="setBonusLines.length > 0" class="set-bonus-lines">
        <li v-for="line in setBonusLines" :key="line">{{ line }}</li>
      </ul>
      <p v-else class="set-bonus-lines">{{ noSetBonusLabel }}</p>
    </div>
    <CharacterMenuButtons>
      <GameButton
        class="button"
        :disabled="!isSelectedWorn"
        :kind="GameButtonKind.Pill"
        @click="emit('enhance', selectedIndex)"
      >
        {{ enhanceLabel }}
      </GameButton>
      <GameButton
        v-if="isSelectedWorn"
        class="button"
        :kind="GameButtonKind.Pill"
        @click="emit('unequip', selectedIndex)"
      >
        {{ unequipLabel }}
      </GameButton>
      <GameButton
        v-else
        class="button"
        :disabled="equipDisabledSlots[selectedIndex]"
        :kind="GameButtonKind.Pill"
        @click="emit('equip', selectedIndex)"
      >
        {{ equipLabel }}
      </GameButton>
      <GameButton v-if="selectedStats" class="button" :kind="GameButtonKind.Pill" @click="emit('lock', selectedIndex)">
        {{ selectedStats.isLocked ? unlockLabel : lockLabel }}
      </GameButton>
    </CharacterMenuButtons>
  </div>
</template>

<style scoped>
/* Measured off the English PC client's Artifacts tab at 21:9, its settled frame at 157.5 seconds of session-2.mp4 (the
   registered reference for it), in units from the panel's top: the details pill at 163, the set bonus block's bottom at
   829 and the buttons at 859. The slots are drawn in the panel's top, which the game draws in the scene. The stats rows
   sit under the details pill from 227, a row of 36 units each, and the set bonus block starts at 420 below them: both are
   provisional, since the registered frame shows no picked piece's stats, so their place is not measured. Colours are
   provisional */
.artifacts {
  position: absolute;
  inset: 0;
  color: #fff;
}

.slots {
  position: absolute;
  top: calc(var(--unit) * 15);
  right: 0;
  left: 0;
  display: flex;
  margin: 0;
  padding: 0;
  gap: calc(var(--unit) * 10);
  list-style: none;
}

.slots > li {
  flex: 1;
}

.slot {
  display: block;
  width: 100%;
  height: calc(var(--unit) * 40);
  padding: 0;
  border: none;
  border-radius: 50%;
  background: rgb(0 0 0 / 0.2);
  cursor: pointer;
}

.slot.worn {
  background: rgb(255 240 180 / 0.55);
  box-shadow: 0 0 calc(var(--unit) * 8) rgb(255 240 180 / 0.6);
}

.slot[aria-pressed="true"] {
  outline: calc(var(--unit) * 2) solid rgb(255 255 255 / 0.8);
  outline-offset: calc(var(--unit) * 2);
}

.details {
  position: absolute;
  top: calc(var(--unit) * 163);
  right: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(var(--unit) * 42);
  border-radius: calc(var(--unit) * 21);
  background: rgb(0 0 0 / 0.2);
}

.stats {
  position: absolute;
  top: calc(var(--unit) * 227);
  right: 0;
  left: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}

.stat {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: calc(var(--unit) * 36);
}

.set-bonus {
  position: absolute;
  top: calc(var(--unit) * 420);
  right: 0;
  bottom: calc(var(--unit) * 80);
  left: 0;
  background: rgb(0 0 0 / 0.1);
}

.set-bonus-heading,
.set-bonus-lines {
  margin: 0;
  padding: 0;
  text-align: center;
  list-style: none;
}

.button {
  flex: 1;
  height: calc(var(--unit) * 52);
}
</style>
