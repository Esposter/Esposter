<script setup lang="ts">
import type { ArtifactSlotStats } from "#src/models/ArtifactSlotStats";

import CharacterMenuButtons from "#src/components/CharacterMenu/Buttons/Index.vue";
import GameButton from "#src/components/GameButton/Index.vue";
import { GameButtonKind } from "#src/models/GameButtonKind";

interface Props {
  // The picked piece's Enhance button label, the game's word for raising a worn artifact's level with its EXP
  enhanceLabel: string;
  // Per slot, whether Fast Equip is disabled there, which it is while no artifact in the bag can be put on that slot
  equipDisabledSlots: boolean[];
  // The picked slot's Equip button label, shown in the details while the slot is empty
  equipLabel: string;
  // The Fast Equip button's label, which puts a bag artifact on the picked slot
  fastEquipLabel: string;
  // Whether the details are open in place of the totals, which swaps the buttons for the picked slot's actions
  isDetailsOpen: boolean;
  // The Lock button's label, shown in the details while the picked worn artifact is unlocked
  lockLabel: string;
  // The picked slot's stats, undefined where the character wears no artifact there
  selectedStats?: ArtifactSlotStats;
  // Each slot's name in the game's order, which Switch counts through
  slotNames: string[];
  // The Switch button's label, which moves the picked slot on to the next one
  switchLabel: string;
  // The Unequip button's label, shown in the details while the picked slot holds a worn artifact
  unequipLabel: string;
  // The Unlock button's label, shown in the details while the picked worn artifact is locked
  unlockLabel: string;
}

// The slot the actions are for, which Switch moves on to the next one
const selectedIndex = defineModel<number>("selectedIndex", { default: 0 });
const {
  enhanceLabel,
  equipDisabledSlots,
  equipLabel,
  fastEquipLabel,
  isDetailsOpen,
  lockLabel,
  selectedStats,
  slotNames,
  switchLabel,
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
const isSelectedWorn = computed(() => selectedStats !== undefined);
</script>

<template>
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
      <GameButton
        class="button"
        :kind="GameButtonKind.Pill"
        tip=""
        @click="selectedIndex = (selectedIndex + 1) % slotNames.length"
      >
        <span class="key" aria-hidden="true">F</span>
        {{ switchLabel }}
      </GameButton>
    </template>
  </CharacterMenuButtons>
</template>

<style scoped>
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
