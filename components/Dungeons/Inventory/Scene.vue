<script setup lang="ts">
import Image from "@/lib/phaser/components/Image.vue";
import Scene from "@/lib/phaser/components/Scene.vue";
import { useInputStore } from "@/lib/phaser/store/phaser/input";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { ImageKey } from "@/models/dungeons/keys/image/ImageKey";
import { useInventoryInputStore } from "@/store/dungeons/inventory/input";

const inputStore = useInputStore();
const { controls } = storeToRefs(inputStore);
const inventoryInputStore = useInventoryInputStore();
const { onPlayerInput } = inventoryInputStore;
</script>

<template>
  <Scene :scene-key="SceneKey.Inventory" @update="(scene) => onPlayerInput(scene, controls.getInput(true))">
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
  </Scene>
</template>
