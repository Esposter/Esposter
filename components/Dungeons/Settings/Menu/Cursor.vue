<script setup lang="ts">
import Rectangle from "@/lib/phaser/components/Rectangle.vue";
import { useSettingsSceneStore } from "@/store/dungeons/settings/scene";

const settingsSceneStore = useSettingsSceneStore();
const { optionGrid } = storeToRefs(settingsSceneStore);
const { width, ...configuration } = useSettingsCursorDimensions(() => optionGrid.value.position.y);
</script>

<template>
  <Rectangle :configuration="{ width, ...configuration, strokeStyle: [4, 0xe4434a] }" />
</template>
