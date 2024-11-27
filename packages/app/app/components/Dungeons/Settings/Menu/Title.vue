<script setup lang="ts">
import { MenuTextStyle } from "@/assets/dungeons/scene/settings/styles/MenuTextStyle";
import { Text } from "vue-phaserjs";

useSettingsMenuWidth((width) => (x.value = width / 2));
const x = ref<number>();
</script>

<template>
  <Text :configuration="{ x, y: 20, origin: 0.5, text: 'Settings', style: MenuTextStyle }" />
</template>
