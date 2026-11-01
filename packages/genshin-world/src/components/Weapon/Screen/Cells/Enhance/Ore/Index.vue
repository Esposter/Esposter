<script setup lang="ts">
import { GameButton, GameButtonKind } from "genshin-interface";

interface Props {
  // The ore the cell offers, with its name, the count the bag holds and the count the player picked
  ore: { name: string; ownedCount: number; pickedCount: number };
}

const { ore } = defineProps<Props>();
const emit = defineEmits<{ pick: []; unpick: [] }>();
</script>

<template>
  <div class="cell">
    <GameButton
      class="pick"
      :disabled="ore.pickedCount >= ore.ownedCount"
      :kind="GameButtonKind.Row"
      tip=""
      @click="emit('pick')"
    >
      <span class="cell-name">{{ ore.name }}</span>
      <span class="plus" aria-hidden="true" />
      <span class="caption" aria-hidden="true">{{ ore.pickedCount || "--" }}</span>
    </GameButton>
    <GameButton v-if="ore.pickedCount > 0" class="unpick" :kind="GameButtonKind.Row" tip="" @click="emit('unpick')">
      −
    </GameButton>
  </div>
</template>

<style scoped src="../../../../../../styles/weaponCells.css"></style>

<style scoped>
.unpick {
  position: absolute;
  top: calc(var(--reference-pixel) * 4);
  right: calc(var(--reference-pixel) * 4);
  width: calc(var(--reference-pixel) * 18);
  height: calc(var(--reference-pixel) * 18);
  padding: 0;
  border: none;
  border-radius: 50%;
  background: rgb(0 0 0 / 0.5);
  color: #fff;
  font: inherit;
  font-size: calc(var(--reference-pixel) * 14);
  line-height: 1;
}
</style>
