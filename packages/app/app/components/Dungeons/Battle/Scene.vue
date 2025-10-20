<script setup lang="ts">
import { BackgroundMusicKey } from "#shared/models/dungeons/keys/sound/BackgroundMusicKey";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/scene/battle/battleStateMachine";
import { playDungeonsBackgroundMusic } from "@/services/dungeons/sound/playDungeonsBackgroundMusic";
import { useBattleSceneStore } from "@/store/dungeons/battle/scene";
import { useControlsStore } from "@/store/dungeons/controls";

const controlsStore = useControlsStore();
const { controls } = storeToRefs(controlsStore);
const battleSceneStore = useBattleSceneStore();
const { onPlayerInput } = battleSceneStore;
</script>

<template>
  <DungeonsScene
    :scene-key="SceneKey.Battle"
    @create="
      async (scene) => {
        playDungeonsBackgroundMusic(scene, BackgroundMusicKey.DecisiveBattle);
        battleStateMachine.scene = scene;
        await battleStateMachine.setState(StateName.Intro);
      }
    "
    @update="onPlayerInput($event, controls.getInput())"
    @shutdown="
      async () => {
        await battleStateMachine.setState();
      }
    "
  >
    <DungeonsBattleBackground />
    <DungeonsBattleMonster is-enemy />
    <DungeonsBattleMonster />
    <DungeonsBattleAttackManager />
    <DungeonsBattleMenu />
    <DungeonsBattleBall />
  </DungeonsScene>
</template>
