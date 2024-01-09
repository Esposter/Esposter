<script setup lang="ts">
import { ClickerIconComponentMap } from "@/services/clicker/ClickerIconComponentMap";
import { useGameStore } from "@/store/clicker/game";
import { type SVGAttributes } from "vue";

interface ClickerModelItemProps {
  gAttrs?: SVGAttributes;
}

const { gAttrs } = defineProps<ClickerModelItemProps>();
const emit = defineEmits<{ click: [value: MouseEvent] }>();
const gameStore = useGameStore();
const { game } = storeToRefs(gameStore);
const clickerIconComponent = computed(() => ClickerIconComponentMap[game.value.type]);
</script>

<template>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <g :="gAttrs" @click="(e) => emit('click', e)">
      <component :is="clickerIconComponent" />
    </g>
  </svg>
</template>
