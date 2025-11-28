<script setup lang="ts">
<<<<<<< HEAD
import { FileKey } from "#shared/generated/phaser/FileKey";
import { SceneKey } from "#shared/models/dungeons/keys/SceneKey";
=======
import { ImageKey } from "#shared/models/dungeons/keys/image/ImageKey";
import { SceneKey } from "#shared/models/dungeons/keys/SceneKey";
>>>>>>> main
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
