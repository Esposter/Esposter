<script setup lang="ts">
import Scene from "@/lib/phaser/components/Scene.vue";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { SceneWithPlugins } from "@/models/dungeons/scenes/plugins/SceneWithPlugins";
</script>

<template>
  <Scene :scene-key="SceneKey.Battle" :cls="SceneWithPlugins">
    <DungeonsBattleBackground />
    <DungeonsBattleHealthBarContainer :position="{ x: 34, y: 34 }" />
    <DungeonsBattleHealthBarContainer :position="{ x: 556, y: 318 }" />
  </Scene>
</template>
