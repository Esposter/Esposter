<script setup lang="ts">
import { MENU_HEIGHT } from "@/services/dungeons/settings/constants";

const width = useSettingsMenuWidth();
</script>

<template>
  <DungeonsUIGlassPanelNineSlice :width :height="MENU_HEIGHT" />
</template>
