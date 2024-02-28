<script setup lang="ts">
import Container from "@/lib/phaser/components/Container.vue";
import { MENU_PADDING } from "@/services/dungeons/settings/menu/constants";
</script>

<template>
  <Container :configuration="{ x: MENU_PADDING, y: 20 }">
    <DungeonsSettingsMenuBackground />
    <DungeonsSettingsMenuText />
  </Container>
</template>
