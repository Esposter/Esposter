<script setup lang="ts">
import { ImageKey } from "@/models/dungeons/keys/image/ImageKey";
import { useInventoryInputStore } from "@/store/dungeons/inventory/input";
import { default as Image, SceneKey, useInputStore } from "vue-phaser";

const inputStore = useInputStore();
const { controls } = storeToRefs(inputStore);
const inventoryInputStore = useInventoryInputStore();
const { onPlayerInput } = inventoryInputStore;
</script>

<template>
  <DungeonsScene :scene-key="SceneKey.Inventory" @update="(scene) => onPlayerInput(scene, controls.getInput(true))">
    <Image
      :configuration="{
        origin: 0,
        texture: ImageKey.InventoryBackground,
      }"
    />
    <Image
      :configuration="{
        x: 40,
        y: 120,
        origin: 0,
        texture: ImageKey.Bag,
        scale: 0.5,
      }"
    />
    <DungeonsInventoryMenu />
  </DungeonsScene>
</template>
