<script setup lang="ts">
import {
  CONTENT_MENU_WIDTH,
  CURSOR_POSITION_INCREMENT,
  INITIAL_CURSOR_POSITION,
} from "@/services/dungeons/scene/inventory/constants";
import { Container } from "vue-phaserjs";

const itemOptionGrid = useItemOptionGrid();
</script>

<template>
  <Container :configuration="{ x: 300, y: 20 }">
    <DungeonsInventoryPanel :width="CONTENT_MENU_WIDTH" :height="360">
      <DungeonsInventoryItemList />
      <DungeonsUIInputCursor
        :grid="itemOptionGrid"
        :initial-position="INITIAL_CURSOR_POSITION"
        :position-increment="CURSOR_POSITION_INCREMENT"
        :scale="3"
      />
    </DungeonsInventoryPanel>
  </Container>
</template>
