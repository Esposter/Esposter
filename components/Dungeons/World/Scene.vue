<script setup lang="ts">
import Image from "@/lib/phaser/components/Image.vue";
import Scene from "@/lib/phaser/components/Scene.vue";
import { ImageKey } from "@/models/dungeons/keys/ImageKey";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { SceneWithPlugins } from "@/models/dungeons/scene/plugins/SceneWithPlugins";
import { CharacterId } from "@/models/dungeons/world/CharacterId";
import { dayjs } from "@/services/dayjs";
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
    @create="
      (scene) => {
        scene.cameras.main.fadeIn(dayjs.duration(0.6, 'seconds').asMilliseconds(), 0, 0, 0);
      }
    "
    @update="
      () => {
        position = controls.move(position);
      }
    "
  >
    <Image :configuration="{ textureKey: ImageKey.WorldHomeBackground, origin: 0 }" />
    <DungeonsWorldCharacter :id="CharacterId.Player" v-model:position="position" :asset="character.asset" />
  </Scene>
</template>
