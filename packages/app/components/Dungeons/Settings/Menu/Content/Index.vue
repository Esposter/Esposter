<script setup lang="ts">
import { getGridKey } from "@/services/dungeons/getGridKey";
import { SettingsOptionGrid } from "@/services/dungeons/scene/settings/SettingsOptionGrid";
</script>

<template>
  <template v-for="(row, rowIndex) in unref(SettingsOptionGrid.grid)" :key="rowIndex">
    <DungeonsSettingsMenuContentClickableRow :row-index="rowIndex" />
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
