<script setup lang="ts">
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { BackgroundMusicKey } from "@/models/dungeons/keys/sound/BackgroundMusicKey";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/scene/battle/battleStateMachine";
import { playDungeonsBackgroundMusic } from "@/services/dungeons/sound/playDungeonsBackgroundMusic";
import { useBattleSceneStore } from "@/store/dungeons/battle/scene";
import { useControlsStore } from "@/store/dungeons/controls";
import { getResultAsync, noop } from "@esposter/shared";

const controlsStore = useControlsStore();
const { controls } = storeToRefs(controlsStore);
const battleSceneStore = useBattleSceneStore();
const { onPlayerInput } = battleSceneStore;
</script>

<template>
  <DungeonsScene
    :scene-key="SceneKey.Battle"
    @create="
      (scene) =>
        getResultAsync(async () => {
          playDungeonsBackgroundMusic(scene, BackgroundMusicKey.DecisiveBattle);
          battleStateMachine.scene = scene;
          await battleStateMachine.setState(StateName.Intro);
        }).match(noop, console.error)
    "
    @update="onPlayerInput($event, controls.getInput())"
    @shutdown="() => getResultAsync(() => battleStateMachine.setState()).match(noop, console.error)"
  >
    <DungeonsBattleBackground />
    <DungeonsBattleMonster is-enemy />
    <DungeonsBattleMonster />
    <DungeonsBattleAttackManager />
    <DungeonsBattleMenu />
    <DungeonsBattleBall />
  </DungeonsScene>
</template>
