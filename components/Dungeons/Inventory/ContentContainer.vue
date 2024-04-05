<script setup lang="ts">
import Container from "@/lib/phaser/components/Container.vue";
import Rectangle from "@/lib/phaser/components/Rectangle.vue";
import {
  CONTENT_MENU_WIDTH,
  CURSOR_POSITION_INCREMENT,
  INITIAL_CURSOR_POSITION,
  MENU_PADDING,
} from "@/services/dungeons/inventory/constants";
import { useInventorySceneStore } from "@/store/dungeons/inventory/scene";

const inventorySceneStore = useInventorySceneStore();
const { itemOptionGrid } = storeToRefs(inventorySceneStore);
const panelHeight = 360;
</script>

<template>
  <Container :configuration="{ x: 300, y: 20 }">
    <DungeonsUIGlassPanelNineSlice :width="CONTENT_MENU_WIDTH" :height="panelHeight" />
    <Rectangle
      :configuration="{
        x: MENU_PADDING,
        y: MENU_PADDING,
        origin: 0,
        width: CONTENT_MENU_WIDTH - MENU_PADDING * 2,
        height: panelHeight - MENU_PADDING * 2,
        fillColor: 0xffff88,
        alpha: 0.6,
      }"
    />
    <DungeonsInventoryItemList />
    <DungeonsUIInputCursor
      :grid="itemOptionGrid"
      :initial-position="INITIAL_CURSOR_POSITION"
      :position-increment="CURSOR_POSITION_INCREMENT"
      :scale="3"
    />
  </Container>
</template>
