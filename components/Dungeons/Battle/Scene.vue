<script setup lang="ts">
import Scene from "@/lib/phaser/components/Scene.vue";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { TextureManagerKey } from "@/models/dungeons/keys/TextureManagerKey";
import { SceneWithPlugins } from "@/models/dungeons/scenes/plugins/SceneWithPlugins";
</script>

<template>
  <Scene :scene-key="SceneKey.Battle" :cls="SceneWithPlugins">
    <DungeonsBattleBackground />
    <DungeonsBattleInfoContainer :scale-y="0.8" :name="TextureManagerKey.Carnodusk" :level="5" />
    <DungeonsBattleInfoContainer :position="{ x: 556, y: 318 }" :name="TextureManagerKey.Iguanignite" :level="5" />
  </Scene>
</template>
