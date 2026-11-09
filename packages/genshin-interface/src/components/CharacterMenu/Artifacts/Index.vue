<script setup lang="ts">
import type { ArtifactSetBonusGroup } from "#src/models/ArtifactSetBonusGroup";
import type { ArtifactSlotStats } from "#src/models/ArtifactSlotStats";
import type { ArtifactStatLine } from "#src/models/ArtifactStatLine";
import type { CharacterMenuArtifactEmits } from "#src/models/CharacterMenuArtifactEmits";

import CharacterMenuArtifactsDetails from "#src/components/CharacterMenu/Artifacts/Details/Index.vue";
import CharacterMenuArtifactsFoot from "#src/components/CharacterMenu/Artifacts/Foot/Index.vue";
import CharacterMenuArtifactsTotals from "#src/components/CharacterMenu/Artifacts/Totals/Index.vue";
import GameButton from "#src/components/GameButton/Index.vue";
import ToastNotice from "#src/components/ToastNotice/Index.vue";
import { GameButtonKind } from "#src/models/GameButtonKind";

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

const { slotStats } = defineProps<Props>();
const emit = defineEmits<CharacterMenuArtifactEmits>();
// The slot the actions are for, the first until Switch moves it on, and whether the details are open in place of the totals
const selectedIndex = ref(0);
const isDetailsOpen = ref(false);
const selectedStats = computed(() => slotStats[selectedIndex.value]);
</script>

<template>
  <!-- The Artifacts tab's panel: the worn artifacts' attribute totals down its top, the set bonus block under them, and the
       Fast Equip and Switch buttons at its foot. Pressing Artifact Details opens the picked slot's stats in place of the totals,
       with its Enhance, Equip or Unequip and Lock buttons at the foot in place of those two -->
  <div class="artifacts">
    <ToastNotice v-if="notice" class="notice">{{ notice }}</ToastNotice>
    <GameButton
      class="details"
      :aria-expanded="isDetailsOpen"
      :kind="GameButtonKind.Row"
      tip=""
      @click="isDetailsOpen = !isDetailsOpen"
    >
      {{ artifactDetailsLabel }}
    </GameButton>
    <CharacterMenuArtifactsDetails v-if="isDetailsOpen" :selected-stats :slot-name="slotNames[selectedIndex]" />
    <CharacterMenuArtifactsTotals v-else :no-set-bonus-label :set-bonus-heading :sets :totals />
    <CharacterMenuArtifactsFoot
      v-model:selected-index="selectedIndex"
      :enhance-label
      :equip-disabled-slots
      :equip-label
      :fast-equip-label
      :is-details-open
      :lock-label
      :selected-stats
      :slot-names
      :switch-label
      :unequip-label
      :unlock-label
      @enhance="(index) => emit('enhance', index)"
      @equip="(index) => emit('equip', index)"
      @lock="(index) => emit('lock', index)"
      @unequip="(index) => emit('unequip', index)"
    />
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
</style>
