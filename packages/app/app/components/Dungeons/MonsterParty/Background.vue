<script setup lang="ts">
import { FileKey } from "#shared/generated/phaser/FileKey";
import { onCreate, Rectangle, TileSprite } from "vue-phaserjs";

const width = ref<number>();
const height = ref<number>();

onCreate((scene) => {
  width.value = scene.scale.width;
  height.value = scene.scale.height;
});
</script>

<template>
  <Rectangle
    :configuration="{
      origin: 0,
      width,
      height,
      fillColor: 0x000,
    }"
  />
  <TileSprite
    :configuration="{
      origin: 0,
      width,
      height,
      texture: FileKey.SceneMonsterPartyBackground,
      alpha: 0.7,
    }"
  />
</template>
