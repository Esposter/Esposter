<script setup lang="ts">
import { DungeonsKeys } from "#shared/generated/hostedAssetKeys/dungeonsKeys";
import { SceneKey } from "#src/models/dungeons/keys/SceneKey";
import { useControlsStore } from "#src/store/dungeons/controls";
import { useInventoryInputStore } from "#src/store/dungeons/inventory/input";
import { Image } from "vue-phaserjs";

const controlsStore = useControlsStore();
const { controls } = storeToRefs(controlsStore);
const inventoryInputStore = useInventoryInputStore();
const { onPlayerInput } = inventoryInputStore;
</script>

<template>
  <DungeonsScene :scene-key="SceneKey.Inventory" @update="onPlayerInput($event, controls.getInput(true))">
    <Image :configuration="{ origin: 0, texture: DungeonsKeys.SceneInventoryBackground }" />
    <Image :configuration="{ x: 40, y: 120, origin: 0, texture: DungeonsKeys.SceneInventoryBag, scale: 0.5 }" />
    <DungeonsInventoryMenu />
  </DungeonsScene>
</template>
