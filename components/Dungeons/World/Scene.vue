<script setup lang="ts">
import Image from "@/lib/phaser/components/Image.vue";
import Scene from "@/lib/phaser/components/Scene.vue";
import { ImageKey } from "@/models/dungeons/keys/ImageKey";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { SceneWithPlugins } from "@/models/dungeons/scene/plugins/SceneWithPlugins";
import { useGameStore } from "@/store/dungeons/game";
import { usePlayerStore } from "@/store/dungeons/world/player";
import { type Position } from "grid-engine";

const gameStore = useGameStore();
const { controls } = storeToRefs(gameStore);
const playerStore = usePlayerStore();
const { character } = storeToRefs(playerStore);
const position = ref<Position>({ x: 1, y: 1 });
</script>

<template>
  <Scene
    :scene-key="SceneKey.World"
    :cls="SceneWithPlugins"
    @update="
      () => {
        position = controls.move(position);
      }
    "
  >
    <Image :configuration="{ textureKey: ImageKey.WorldBackground, origin: 0 }" />
    <DungeonsWorldCharacter :position="position" :asset="character.asset" />
  </Scene>
</template>
