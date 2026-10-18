<script setup lang="ts">
import GameButton from "#src/components/GameButton/Index.vue";
import { GameButtonKind } from "#src/models/GameButtonKind";
import { computed, ref } from "vue";

interface Props {
  // The Enhance button's label, the game's word for raising a worn artifact's level with its EXP
  enhanceLabel: string;
  // The Equip button's label, shown while the picked slot is empty
  equipLabel: string;
  // Each of the character's five artifact slots, in the game's order, true where an artifact is worn
  equipped: boolean[];
  // Whether Equip is disabled, which it is while no artifact in the bag can be put on the picked slot
  isEquipDisabled: boolean;
  // The words the set bonus block shows while no bonus is active
  noSetBonusLabel: string;
  // The set bonus block's heading, the game's word for its bonuses
  setBonusHeading: string;
  // Each bonus the worn artifacts' set grants, as its line in the game's words, empty while none is active
  setBonusLines: string[];
  // Each slot's name in the game's order, which its disc is labelled by and the details pill shows for the picked slot
  slotNames: string[];
  // The Unequip button's label, shown while the picked slot holds a worn artifact
  unequipLabel: string;
}

const {
  enhanceLabel,
  equipLabel,
  equipped,
  isEquipDisabled,
  noSetBonusLabel,
  setBonusHeading,
  setBonusLines,
  slotNames,
  unequipLabel,
} = defineProps<Props>();
// Each action names the slot it is taken on by its index
const emit = defineEmits<{ enhance: [index: number]; equip: [index: number]; unequip: [index: number] }>();
// The slot the details and buttons are for, the first until a disc is picked
const selectedIndex = ref(0);
const isSelectedWorn = computed(() => equipped[selectedIndex.value] === true);
</script>

<template>
  <!-- The Artifacts tab's panel: the five slots down its top, each a disc lit where the character wears an artifact and
       picked by a click, the picked slot's name in the details pill, the set bonus block below it, and the Enhance and
       Equip or Unequip buttons at its foot. The picked artifact's main and sub stats are not drawn yet -->
  <div class="artifacts">
    <ul class="slots">
      <li v-for="(isWorn, index) in equipped" :key="index">
        <button
          class="slot"
          :aria-label="slotNames[index]"
          :aria-pressed="index === selectedIndex"
          :class="{ worn: isWorn }"
          type="button"
          @click="selectedIndex = index"
        />
      </li>
    </ul>
    <div class="details">{{ slotNames[selectedIndex] }}</div>
    <div class="set-bonus">
      <p class="set-bonus-heading">{{ setBonusHeading }}</p>
      <ul v-if="setBonusLines.length > 0" class="set-bonus-lines">
        <li v-for="line in setBonusLines" :key="line">{{ line }}</li>
      </ul>
      <p v-else class="set-bonus-lines">{{ noSetBonusLabel }}</p>
    </div>
    <div class="buttons">
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
        :disabled="isEquipDisabled"
        :kind="GameButtonKind.Pill"
        @click="emit('equip', selectedIndex)"
      >
        {{ equipLabel }}
      </GameButton>
    </div>
  </div>
</template>

<style scoped>
/* Measured off the English PC client's Artifacts tab at 21:9, its settled frame at 157.5 seconds of session-2.mp4 (the
   registered reference for it), in units from the panel's top: the details pill at 163, the set bonus block from 227
   to 829 and the buttons at 859. The slots are drawn in the panel's top, which the game draws in the scene. Colours are
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

.set-bonus {
  position: absolute;
  top: calc(var(--unit) * 227);
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
}
</style>
