<script setup lang="ts">
import Rectangle from "@/lib/phaser/components/Rectangle.vue";
import { INITIAL_SETTINGS_POSITION, SETTINGS_POSITION_INCREMENT } from "@/services/dungeons/settings/menu/constants";
import { useSettingsSceneStore } from "@/store/dungeons/settings/scene";

const settingsSceneStore = useSettingsSceneStore();
const { optionGrid } = storeToRefs(settingsSceneStore);
const settingsMenuWidth = useSettingsMenuWidth();
const width = computed(() => settingsMenuWidth.value - INITIAL_SETTINGS_POSITION.x);
</script>

<template>
  <Rectangle
    :configuration="{
      x: INITIAL_SETTINGS_POSITION.x / 2,
      y: INITIAL_SETTINGS_POSITION.y + SETTINGS_POSITION_INCREMENT.y * optionGrid.position.y - 3,
      width,
      height: SETTINGS_POSITION_INCREMENT.y - 15,
      origin: 0,
      strokeStyle: [4, 0xe4434a],
    }"
  />
</template>
