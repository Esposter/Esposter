<script setup lang="ts">
import { MenuTextStyle } from "@/assets/dungeons/scene/settings/styles/MenuTextStyle";

useSettingsMenuWidth((width) => (x.value = width / 2));
const x = ref<number>();
</script>

<template>
  <DungeonsText :configuration="{ x, y: 20, origin: 0.5, text: 'Settings', style: MenuTextStyle }" />
</template>
