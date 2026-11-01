<script setup lang="ts">
import { GameButton, GameButtonKind } from "genshin-interface";

interface Props {
  // The copies of the weapon the bag holds beside it, which the Refine tab offers, each with its name and level
  copyCells: { id: number; levelText: string; name: string }[];
  // Whether the bag holds the refinement material at all, which a refinement can take in place of a copy
  isRefinementMaterialHeld: boolean;
  // The copy the Refine tab picked, which stands in for the material when it is set
  pickedCopyId?: number;
  // The refinement material the Refine tab offers, with the count the bag holds of it
  refinementMaterial?: { count: number; name: string };
}

const { copyCells, isRefinementMaterialHeld, pickedCopyId, refinementMaterial } = defineProps<Props>();
const emit = defineEmits<{ pickCopy: [id: number]; pickMaterial: [] }>();
</script>

<template>
  <div v-if="refinementMaterial && isRefinementMaterialHeld" class="cell">
    <GameButton
      class="pick"
      :aria-pressed="pickedCopyId === undefined"
      :kind="GameButtonKind.Row"
      tip=""
      @click="emit('pickMaterial')"
    >
      <span class="cell-name">{{ refinementMaterial.name }}</span>
      <span class="plus" aria-hidden="true" />
      <span class="caption" aria-hidden="true">{{ refinementMaterial.count }}</span>
    </GameButton>
  </div>
  <div v-for="copy of copyCells" :key="copy.id" class="cell">
    <GameButton
      class="pick"
      :aria-pressed="pickedCopyId === copy.id"
      :kind="GameButtonKind.Row"
      tip=""
      @click="emit('pickCopy', copy.id)"
    >
      <span class="cell-name">{{ copy.name }}</span>
      <span class="plus" aria-hidden="true" />
      <span class="caption" aria-hidden="true">{{ copy.levelText }}</span>
    </GameButton>
  </div>
</template>

<style scoped src="../../../../../styles/weaponCells.css"></style>
