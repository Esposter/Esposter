<script setup lang="ts">
import { FileKey } from "#shared/generated/phaser/FileKey";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { useControlsStore } from "@/store/dungeons/controls";
import { useInventoryInputStore } from "@/store/dungeons/inventory/input";
import { Image } from "vue-phaserjs";

const controlsStore = useControlsStore();
const { controls } = storeToRefs(controlsStore);
const inventoryInputStore = useInventoryInputStore();
const { onPlayerInput } = inventoryInputStore;
</script>

<template>
  <DungeonsScene :scene-key="SceneKey.Inventory" @update="(scene) => onPlayerInput(scene, controls.getInput(true))">
    <Image
      :configuration="{
        origin: 0,
        texture: FileKey.SceneInventoryBackground,
      }"
    />
    <Image
      :configuration="{
        x: 40,
        y: 120,
        origin: 0,
        texture: FileKey.SceneInventoryBag,
        scale: 0.5,
      }"
    />
    <DungeonsInventoryMenu />
  </DungeonsScene>
</template>
