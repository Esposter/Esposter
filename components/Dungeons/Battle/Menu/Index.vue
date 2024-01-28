<script setup lang="ts">
import Rectangle from "@/lib/phaser/components/Rectangle.vue";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { MENU_HEIGHT, MENU_PADDING } from "@/services/dungeons/battle/UI/menu/constants";

const phaserStore = usePhaserStore();
const { scene } = storeToRefs(phaserStore);
const y = computed(() => scene.value.scale.height - MENU_HEIGHT - MENU_PADDING);
const width = computed(() => scene.value.scale.width - MENU_PADDING * 2);
</script>

<template>
  <Rectangle
    :configuration="{
      x: MENU_PADDING,
      y,
      width,
      height: MENU_HEIGHT,
      origin: 0,
      fillColor: 0xede4f3,
      strokeStyle: [MENU_PADDING * 2, 0xe4434a],
    }"
  />
  <DungeonsBattleMenuPanelAttackOption />
  <DungeonsBattleMenuPanelInfo />
  <DungeonsBattleMenuPanelOption />
</template>
