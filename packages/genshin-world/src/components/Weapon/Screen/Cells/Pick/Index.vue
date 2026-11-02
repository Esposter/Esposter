<script setup lang="ts">
import { GameButton, GameButtonKind } from "genshin-interface";

interface Props {
  // The caption under the cell's plus, the level, count or "--" the cell shows beneath its art
  caption: number | string;
  // Whether the cell is greyed out and takes no pick, as an ore the player has picked as many of as the bag holds
  isDisabled?: boolean;
  // Whether the cell is pressed, as the fodder, copy or material it stands for is picked
  isPressed?: boolean;
  // The cell's name, read aloud over the whole cell, which its art is not drawn over
  name: string;
}

const { caption, isDisabled, isPressed, name } = defineProps<Props>();
const emit = defineEmits<{ pick: [] }>();
</script>

<template>
  <GameButton
    class="pick"
    :aria-pressed="isPressed"
    :disabled="isDisabled"
    :kind="GameButtonKind.Row"
    tip=""
    @click="emit('pick')"
  >
    <span class="cell-name">{{ name }}</span>
    <span class="plus" aria-hidden="true" />
    <span class="caption" aria-hidden="true">{{ caption }}</span>
  </GameButton>
</template>

<style scoped src="../../../../../styles/weaponCells.css"></style>
