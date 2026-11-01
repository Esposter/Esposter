<script setup lang="ts">
import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";

import GcgScreenCharacter from "#src/components/Gcg/Screen/Character/Index.vue";

interface Props {
  // The side's active character, by its index
  activeIndex: number;
  // The side's characters in the order it holds them, each with whether a click on it does something for the player now
  characters: { character: GcgCharacterState; isChoosable: boolean }[];
  // The characters' names in the reader's language, by their game text ids
  textMap: Readonly<Record<string, string>>;
}

const { activeIndex, characters, textMap } = defineProps<Props>();
const emit = defineEmits<{ select: [characterIndex: number] }>();
</script>

<template>
  <!-- A side's characters across the board, the active one raised by its class -->
  <div class="row">
    <GcgScreenCharacter
      v-for="(item, index) in characters"
      :key="index"
      :aura="item.character.aura"
      :class="{ active: index === activeIndex }"
      :energy="item.character.energy"
      :hp="item.character.hp"
      :is-choosable="item.isChoosable"
      :max-energy="item.character.character.maxEnergy"
      :name="textMap[item.character.character.nameTextId] ?? ''"
      :shield="item.character.shield"
      @select="emit('select', index)"
    />
  </div>
</template>

<style scoped>
.row {
  position: absolute;
  width: 0;
  height: 0;
}

.row > :nth-child(1) {
  left: calc(var(--unit) * 668);
}

.row > :nth-child(2) {
  left: calc(var(--unit) * 878);
}

.row > :nth-child(3) {
  left: calc(var(--unit) * 1088);
}

.row > .active {
  transform: translateY(calc(var(--unit) * -40));
}
</style>
