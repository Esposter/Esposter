<script setup lang="ts">
import { MenuTextStyle } from "@/assets/dungeons/scene/inventory/styles/MenuTextStyle";
import { MENU_PADDING } from "@/services/dungeons/scene/inventory/constants";
import { Container, Rectangle, Text } from "vue-phaserjs";

const panelWidth = 240;
const panelHeight = 64;
</script>

<template>
  <Container :configuration="{ x: 64, y: 20 }">
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
    <Text :configuration="{ x: 116, y: 28, origin: 0.5, text: 'Items', style: MenuTextStyle }" />
  </Container>
</template>
