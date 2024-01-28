<script setup lang="ts">
import Scene from "@/lib/phaser/components/Scene.vue";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { SceneWithPlugins } from "@/models/dungeons/scenes/plugins/SceneWithPlugins";
import { useBattleSceneStore } from "~/store/dungeons/scene/battle";
import { usePlayerStore } from "~/store/dungeons/scene/battle/player";

const battleSceneStore = useBattleSceneStore();
const { activeEnemyMonster } = storeToRefs(battleSceneStore);
const playerStore = usePlayerStore();
const { activeMonster } = storeToRefs(playerStore);
</script>

<template>
  <Scene :scene-key="SceneKey.Battle" :cls="SceneWithPlugins">
    <DungeonsBattleBackground />
    <DungeonsBattleMonster :monster="activeEnemyMonster" is-enemy />
    <DungeonsBattleMonster :monster="activeMonster" />
    <DungeonsBattleMenu />
  </Scene>
</template>
