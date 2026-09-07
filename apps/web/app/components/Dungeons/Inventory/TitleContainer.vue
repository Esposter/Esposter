<script setup lang="ts">
import { MenuTextStyle } from "@/assets/dungeons/scene/inventory/styles/MenuTextStyle";
import { Container, Text } from "vue-phaserjs";
</script>

<template>
  <Container :configuration="{ x: 64, y: 20 }">
    <DungeonsInventoryPanel :width="240" :height="64">
      <Text :configuration="{ x: 116, y: 28, origin: 0.5, text: 'Items', style: MenuTextStyle }" />
    </DungeonsInventoryPanel>
  </Container>
</template>
