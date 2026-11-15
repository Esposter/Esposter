<script setup lang="ts">
import { SceneKey } from "#src/models/dungeons/keys/SceneKey";
import { BackgroundMusicKey } from "#src/models/dungeons/keys/sound/BackgroundMusicKey";
import { StateName } from "#src/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "#src/services/dungeons/scene/battle/battleStateMachine";
import { playDungeonsBackgroundMusic } from "#src/services/dungeons/sound/playDungeonsBackgroundMusic";
import { StateMap } from "#src/services/dungeons/state/battle/StateMap";
import { useBattlePlayerStore } from "#src/store/dungeons/battle/player";
import { useBattleSceneStore } from "#src/store/dungeons/battle/scene";
import { useControlsStore } from "#src/store/dungeons/controls";
import { getResultAsync, noop } from "@esposter/shared";

const controlsStore = useControlsStore();
const { controls } = storeToRefs(controlsStore);
const battleSceneStore = useBattleSceneStore();
const { onPlayerInput } = battleSceneStore;
const battlePlayerStore = useBattlePlayerStore();
const { resetActiveMonster } = battlePlayerStore;
</script>

<template>
  <DungeonsScene
    :scene-key="SceneKey.Battle"
    @create="
      (scene) =>
        getResultAsync(async () => {
          playDungeonsBackgroundMusic(scene, BackgroundMusicKey.DecisiveBattle);
          battleStateMachine.scene = scene;
          battleStateMachine.stateMap = StateMap;
          resetActiveMonster();
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
