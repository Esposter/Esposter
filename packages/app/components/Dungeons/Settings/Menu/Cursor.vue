<script setup lang="ts">
import Rectangle from "@/lib/phaser/components/Rectangle.vue";
import { SettingsOptionGrid } from "@/services/dungeons/scene/settings/SettingsOptionGrid";

const { width, y, ...configuration } = useSettingsCursorDimensions(() => SettingsOptionGrid.position.value.y);
</script>

<template>
  <Rectangle :configuration="{ y, width, ...configuration, strokeStyle: [4, 0xe4434a] }" />
</template>
