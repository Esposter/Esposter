<script setup lang="ts">
import { HIGHLIGHT_BORDER_COLOR } from "#src/services/dungeons/UI/constants";
import { useSettingsSceneStore } from "#src/store/dungeons/settings/scene";
import { Rectangle } from "vue-phaserjs";

const settingsSceneStore = useSettingsSceneStore();
const { settingsOptionGrid } = settingsSceneStore;
const { width, y, ...configuration } = useSettingsCursorDimensions(() => settingsOptionGrid.position.value.y);
</script>

<template>
  <Rectangle :configuration="{ y, width, ...configuration, strokeStyle: [4, HIGHLIGHT_BORDER_COLOR] }" />
</template>
