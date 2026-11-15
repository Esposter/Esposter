<script setup lang="ts">
import { SettingsOptionGrid } from "#src/services/dungeons/scene/settings/SettingsOptionGrid";
import { HIGHLIGHT_BORDER_COLOR } from "#src/services/dungeons/UI/constants";
import { Rectangle } from "vue-phaserjs";

const { width, y, ...configuration } = useSettingsCursorDimensions(() => SettingsOptionGrid.position.value.y);
</script>

<template>
  <Rectangle :configuration="{ y, width, ...configuration, strokeStyle: [4, HIGHLIGHT_BORDER_COLOR] }" />
</template>
