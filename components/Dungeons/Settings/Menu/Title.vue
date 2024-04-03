<script setup lang="ts">
import { MenuTextStyle } from "@/assets/dungeons/settings/styles/MenuTextStyle";
import Text from "@/lib/phaser/components/Text.vue";

const settingsMenuWidth = useSettingsMenuWidth();
</script>

<template>
  <Text
    :configuration="{
      x: settingsMenuWidth / 2,
      y: 20,
      origin: 0.5,
      text: 'Settings',
      style: MenuTextStyle,
    }"
  />
</template>
