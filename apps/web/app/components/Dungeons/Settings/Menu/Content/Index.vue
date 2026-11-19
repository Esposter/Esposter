<script setup lang="ts">
import { getPositionId } from "#src/services/dungeons/direction/getPositionId";
import { useSettingsSceneStore } from "#src/store/dungeons/settings/scene";

const settingsSceneStore = useSettingsSceneStore();
const { settingsOptionGrid } = settingsSceneStore;
</script>

<template>
  <template v-for="(row, rowIndex) of unref(settingsOptionGrid.grid)" :key="rowIndex">
    <DungeonsSettingsMenuContentClickableRow :row-index />
    <DungeonsSettingsMenuContentText
      v-for="(text, columnIndex) of row"
      :key="getPositionId({ x: columnIndex, y: rowIndex })"
      :row-index
      :column-index
      :text
    />
  </template>
  <DungeonsSettingsMenuVolumeSlider />
  <DungeonsSettingsMenuThemeModePicker />
  <DungeonsSettingsMenuCursor />
</template>
