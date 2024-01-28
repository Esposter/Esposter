<script setup lang="ts">
import Scene from "@/lib/phaser/components/Scene.vue";
import { PlayerSpecialInput } from "@/models/dungeons/input/PlayerSpecialInput";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { SceneWithPlugins } from "@/models/dungeons/scenes/plugins/SceneWithPlugins";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/battle/battleStateMachine";
import { mapCursorKeysToDirection } from "@/services/dungeons/input/mapCursorKeysToDirection";
import { useBattleSceneStore } from "@/store/dungeons/scene/battle";
import { Input, type Types } from "phaser";

const battleSceneStore = useBattleSceneStore();
const { onPlayerInput } = battleSceneStore;
const { cursorKeys } = storeToRefs(battleSceneStore);
</script>

<template>
  <Scene
    :scene-key="SceneKey.Battle"
    :cls="SceneWithPlugins"
    @create="
      (scene) => {
        cursorKeys = scene.input.keyboard!.createCursorKeys();
        battleStateMachine.setState(StateName.Intro);
      }
    "
    @update="
      () => {
        const assertedCursorKeys = cursorKeys as Types.Input.Keyboard.CursorKeys;
        battleStateMachine.update();
        if (Input.Keyboard.JustDown(assertedCursorKeys.space)) onPlayerInput(PlayerSpecialInput.Confirm);
        else if (Input.Keyboard.JustDown(assertedCursorKeys.shift)) onPlayerInput(PlayerSpecialInput.Cancel);
        else onPlayerInput(mapCursorKeysToDirection(assertedCursorKeys));
      }
    "
  >
    <DungeonsBattleBackground />
    <DungeonsBattleMonster is-enemy />
    <DungeonsBattleMonster />
    <DungeonsBattleMenu />
  </Scene>
</template>
