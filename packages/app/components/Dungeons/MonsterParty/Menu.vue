<script setup lang="ts">
import { onCreate } from "@/lib/phaser/hooks/onCreate";
import { MENU_PADDING, MENU_WIDTH } from "@/services/dungeons/UI/menu/constants";
import { useMonsterPartySceneStore } from "@/store/dungeons/monsterParty/scene";
import type { Position } from "grid-engine";

const monsterPartySceneStore = useMonsterPartySceneStore();
const { isMenuVisible, menuOptionGrid } = storeToRefs(monsterPartySceneStore);
const position = ref<Position>();

onCreate((scene) => {
  position.value = {
    x: scene.scale.width - MENU_PADDING * 2 - MENU_WIDTH,
    y: scene.scale.height + MENU_PADDING * 2,
  };
});
</script>

<template>
  <DungeonsUIMenu v-if="position" v-model:menu="isMenuVisible" v-model:grid="menuOptionGrid" :position />
</template>
