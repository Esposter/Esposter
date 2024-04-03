<script setup lang="ts">
import Image from "@/lib/phaser/components/Image.vue";
import Scene from "@/lib/phaser/components/Scene.vue";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { ImageKey } from "@/models/dungeons/keys/image/ImageKey";
import { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { useGameStore } from "@/store/dungeons/game";
import { useSettingsSceneStore } from "@/store/dungeons/settings/scene";

const gameStore = useGameStore();
const { controls } = storeToRefs(gameStore);
const settingsSceneStore = useSettingsSceneStore();
const { onPlayerInput } = settingsSceneStore;
</script>

<template>
  <Scene :scene-key="SceneKey.Inventory" :cls="SceneWithPlugins">
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
