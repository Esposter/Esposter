<script setup lang="ts">
import { getGridKey } from "@/services/dungeons/getGridKey";
import { useSettingsSceneStore } from "@/store/dungeons/settings/scene";

const settingsSceneStore = useSettingsSceneStore();
const { optionGrid } = storeToRefs(settingsSceneStore);
</script>

<template>
  <template v-for="(row, rowIndex) in optionGrid.grid" :key="rowIndex">
    <DungeonsSettingsMenuContentText
      v-for="(text, columnIndex) in row"
      :key="getGridKey(rowIndex, columnIndex)"
      :row-index="rowIndex"
      :column-index="columnIndex"
      :text="text"
    />
  </template>
  <DungeonsSettingsMenuVolumeSlider />
  <DungeonsSettingsMenuThemeModePicker />
  <DungeonsSettingsMenuCursor />
</template>
