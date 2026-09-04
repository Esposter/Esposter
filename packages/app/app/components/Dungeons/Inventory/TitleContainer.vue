<script setup lang="ts">
import { MenuTextStyle } from "@/assets/dungeons/scene/inventory/styles/MenuTextStyle";
import { Container, Text } from "vue-phaserjs";

const PANEL_WIDTH = 240;
const PANEL_HEIGHT = 64;
</script>

<template>
  <Container :configuration="{ x: 64, y: 20 }">
    <DungeonsInventoryPanel :width="PANEL_WIDTH" :height="PANEL_HEIGHT">
      <Text :configuration="{ x: 116, y: 28, origin: 0.5, text: 'Items', style: MenuTextStyle }" />
    </DungeonsInventoryPanel>
  </Container>
</template>
