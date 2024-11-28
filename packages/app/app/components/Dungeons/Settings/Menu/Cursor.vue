<script setup lang="ts">
import { SettingsOptionGrid } from "@/services/dungeons/scene/settings/SettingsOptionGrid";
import { Rectangle } from "vue-phaserjs";

const { width, y, ...configuration } = useSettingsCursorDimensions(() => SettingsOptionGrid.position.value.y);
</script>

<template>
  <Rectangle :configuration="{ y, width, ...configuration, strokeStyle: [4, 0xe4434a] }" />
</template>
