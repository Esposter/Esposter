<script setup lang="ts">
import Scene from "@/lib/phaser/components/Scene.vue";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { BackgroundMusicKey } from "@/models/dungeons/keys/sound/BackgroundMusicKey";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/scene/battle/battleStateMachine";
import { useBattleSceneStore } from "@/store/dungeons/battle/scene";
import { useGameStore } from "@/store/dungeons/game";

const gameStore = useGameStore();
const { controls } = storeToRefs(gameStore);
const battleSceneStore = useBattleSceneStore();
const { onPlayerInput } = battleSceneStore;
</script>

<template>
  <Scene
    :scene-key="SceneKey.Battle"
    @create="
      () => {
        useDungeonsBackgroundMusic(BackgroundMusicKey.DecisiveBattle);
        battleStateMachine.setState(StateName.Intro);
      }
    "
    @update="
      () => {
        battleStateMachine.update();
        onPlayerInput(controls.getInput());
      }
    "
    @shutdown="
      () => {
        battleStateMachine.setState(null);
      }
    "
  >
    <DungeonsBattleBackground />
    <DungeonsBattleMonster is-enemy />
    <DungeonsBattleMonster />
    <DungeonsBattleAttackManager />
    <DungeonsBattleMenu />
  </Scene>
</template>
