<script setup lang="ts">
import { MenuTextStyle } from "@/assets/dungeons/scene/inventory/styles/MenuTextStyle";
import { Container, Text } from "vue-phaserjs";

const panelWidth = 240;
const panelHeight = 64;
</script>

<template>
  <Container :configuration="{ x: 64, y: 20 }">
    <DungeonsInventoryPanel :width="panelWidth" :height="panelHeight">
      <Text :configuration="{ x: 116, y: 28, origin: 0.5, text: 'Items', style: MenuTextStyle }" />
    </DungeonsInventoryPanel>
  </Container>
</template>
