<script setup lang="ts">
import WeaponScreenCellsEnhanceOre from "#src/components/Weapon/Screen/Cells/Enhance/Ore/Index.vue";
import { GameButton, GameButtonKind } from "genshin-interface";

interface Props {
  // The bag's other weapons the Enhance tab offers as fodder, each with its name, its level and whether it is picked
  fodderCells: { id: number; levelText: string; name: string; picked: boolean }[];
  // The ores the Enhance tab offers, each with the count the bag holds and the count the player picked
  oreCells: { id: number; name: string; ownedCount: number; pickedCount: number }[];
}

const { fodderCells, oreCells } = defineProps<Props>();
const emit = defineEmits<{ pickOre: [id: number]; toggleFodder: [id: number]; unpickOre: [id: number] }>();
</script>

<template>
  <WeaponScreenCellsEnhanceOre
    v-for="ore of oreCells"
    :key="ore.id"
    :ore
    @pick="emit('pickOre', ore.id)"
    @unpick="emit('unpickOre', ore.id)"
  />
  <div v-for="fodder of fodderCells" :key="fodder.id" class="cell">
    <GameButton
      class="pick"
      :aria-pressed="fodder.picked"
      :kind="GameButtonKind.Row"
      tip=""
      @click="emit('toggleFodder', fodder.id)"
    >
      <span class="cell-name">{{ fodder.name }}</span>
      <span class="plus" aria-hidden="true" />
      <span class="caption" aria-hidden="true">{{ fodder.levelText }}</span>
    </GameButton>
  </div>
</template>

<style scoped src="../../../../../styles/weaponCells.css"></style>
