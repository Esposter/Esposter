<script setup lang="ts">
import Image from "@/lib/phaser/components/Image.vue";
import Scene from "@/lib/phaser/components/Scene.vue";
import { ImageKey } from "@/models/dungeons/keys/ImageKey";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { SceneWithPlugins } from "@/models/dungeons/scene/plugins/SceneWithPlugins";
import { usePlayerStore } from "@/store/dungeons/world/player";

const playerStore = usePlayerStore();
const { character } = storeToRefs(playerStore);
</script>

<template>
  <Scene :scene-key="SceneKey.World" :cls="SceneWithPlugins">
    <Image :configuration="{ textureKey: ImageKey.WorldBackground, origin: 0 }" />
    <DungeonsWorldCharacter :position="{ x: 1, y: 1 }" :asset="character.asset" />
  </Scene>
</template>
