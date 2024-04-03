<script setup lang="ts">
import Container from "@/lib/phaser/components/Container.vue";
import Rectangle from "@/lib/phaser/components/Rectangle.vue";
import { MENU_PADDING } from "@/services/dungeons/inventory/constants";

const panelWidth = 700;
const panelHeight = 360;
</script>

<template>
  <DungeonsInventoryTitleContainer />
  <Container :configuration="{ x: 300, y: 20 }">
    <DungeonsUIGlassPanelNineSlice :width="panelWidth" :height="panelHeight" />
    <Rectangle
      :configuration="{
        x: MENU_PADDING,
        y: MENU_PADDING,
        origin: 0,
        width: panelWidth - MENU_PADDING * 2,
        height: panelHeight - MENU_PADDING * 2,
        fillColor: 0xffff88,
        alpha: 0.6,
      }"
    />
  </Container>
</template>
