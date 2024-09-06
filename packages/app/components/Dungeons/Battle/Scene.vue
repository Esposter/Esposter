<script setup lang="ts">
import Scene from "@/lib/phaser/components/Scene.vue";
import { useInputStore } from "@/lib/phaser/store/input";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { BackgroundMusicKey } from "@/models/dungeons/keys/sound/BackgroundMusicKey";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/scene/battle/battleStateMachine";
import { playDungeonsBackgroundMusic } from "@/services/dungeons/sound/playDungeonsBackgroundMusic";
import { useBattleSceneStore } from "@/store/dungeons/battle/scene";

const inputStore = useInputStore();
const { controls } = storeToRefs(inputStore);
const battleSceneStore = useBattleSceneStore();
const { onPlayerInput } = battleSceneStore;
</script>

<template>
  <Scene
    :scene-key="SceneKey.Battle"
    @create="
      async (scene) => {
        playDungeonsBackgroundMusic(scene, BackgroundMusicKey.DecisiveBattle);
        battleStateMachine.scene = scene;
        await battleStateMachine.setState(StateName.Intro);
      }
    "
    @update="
      (scene) => {
        battleStateMachine.update();
        onPlayerInput(scene, controls.getInput());
      }
    "
    @shutdown="
      async () => {
        await battleStateMachine.setState(null);
      }
    "
  >
    <DungeonsBattleBackground />
    <DungeonsBattleMonster is-enemy />
    <DungeonsBattleMonster />
    <DungeonsBattleAttackManager />
    <DungeonsBattleMenu />
    <DungeonsBattleBall />
  </Scene>
</template>
