<script setup lang="ts">
import { MENU_HEIGHT } from "#src/services/dungeons/scene/settings/constants";

const width = useSettingsMenuWidth();
</script>

<template>
  <DungeonsUIGlassPanelNineSlice :width :height="MENU_HEIGHT" />
</template>
