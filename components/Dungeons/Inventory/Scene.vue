<script setup lang="ts">
import Container from "@/lib/phaser/components/Container.vue";
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
        texture: ImageKey.InventoryBackground,
        origin: 0,
      }"
    />
    <Image
      :configuration="{
        x: 40,
        y: 120,
        texture: ImageKey.Bag,
        origin: 0,
        scale: 0.5,
      }"
    />
    <Container :configuration="{ x: 300, y: 20 }">
      <DungeonsUIGlassPanelNineSlice :width="700" :height="360" />
    </Container>
  </Scene>
</template>
