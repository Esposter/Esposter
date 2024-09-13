<script setup lang="ts">
import { MENU_HORIZONTAL_PADDING, MENU_VERTICAL_PADDING } from "@/services/dungeons/scene/settings/constants";
import { Container } from "vue-phaserjs";
</script>

<template>
  <Container :configuration="{ x: MENU_HORIZONTAL_PADDING, y: MENU_VERTICAL_PADDING }">
    <DungeonsSettingsMenuBackground />
    <DungeonsSettingsMenuTitle />
    <DungeonsSettingsMenuContent />
    <DungeonsSettingsInfoContainer />
  </Container>
</template>
