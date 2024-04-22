<script setup lang="ts">
import Container from "@/lib/phaser/components/Container.vue";
import { MENU_HORIZONTAL_PADDING, MENU_VERTICAL_PADDING } from "@/services/dungeons/scene/settings/constants";
</script>

<template>
  <Container :configuration="{ x: MENU_HORIZONTAL_PADDING, y: MENU_VERTICAL_PADDING }">
    <DungeonsSettingsMenuBackground />
    <DungeonsSettingsMenuTitle />
    <DungeonsSettingsMenuContent />
    <DungeonsSettingsInfoContainer />
  </Container>
</template>
