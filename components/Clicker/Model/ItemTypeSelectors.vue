<script setup lang="ts">
import { ClickerType } from "@/models/clicker/ClickerType";
import { ClickerIconComponentMap } from "@/services/clicker/ClickerIconComponentMap";
import { useGameStore } from "@/store/clicker/game";

const gameStore = useGameStore();
const { game } = storeToRefs(gameStore);
const { surface } = useColors();
</script>

<template>
  <v-btn
    v-for="clickerType in Object.values(ClickerType)"
    :key="clickerType"
    class="border-sm"
    :active="game.type === clickerType"
    @click="game.type = clickerType"
  >
    <svg w-8 h-8 xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <g>
        <component :is="ClickerIconComponentMap[clickerType]" />
      </g>
    </svg>
  </v-btn>
</template>

<style scoped lang="scss">
.v-btn {
  background-color: v-bind(surface) !important;

  &:not(:first-of-type) {
    margin-left: 1rem;
  }
}
</style>
