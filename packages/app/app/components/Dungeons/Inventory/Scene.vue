<script setup lang="ts">
import { ImageKey } from "#shared/models/dungeons/keys/image/ImageKey";
import { SceneKey } from "#shared/models/dungeons/keys/SceneKey";
import { useControlsStore } from "@/store/dungeons/controls";
import { useInventoryInputStore } from "@/store/dungeons/inventory/input";
import { Image } from "vue-phaserjs";

const controlsStore = useControlsStore();
const { controls } = storeToRefs(controlsStore);
const inventoryInputStore = useInventoryInputStore();
const { onPlayerInput } = inventoryInputStore;
</script>

<template>
  <DungeonsScene :scene-key="SceneKey.Inventory" @update="onPlayerInput($event, controls.getInput(true))">
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
