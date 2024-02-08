<script setup lang="ts">
import Scene from "@/lib/phaser/components/Scene.vue";
import { PlayerSpecialInput } from "@/models/dungeons/input/PlayerSpecialInput";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { SceneWithPlugins } from "@/models/dungeons/scene/plugins/SceneWithPlugins";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/battle/battleStateMachine";
import { mapCursorKeysToDirection } from "@/services/dungeons/input/mapCursorKeysToDirection";
import { useBattleSceneStore } from "@/store/dungeons/battle/scene";
import { useGameStore } from "@/store/dungeons/game";
import { Input, type Types } from "phaser";

const gameStore = useGameStore();
const { controls } = storeToRefs(gameStore);
const battleSceneStore = useBattleSceneStore();
const { onPlayerInput } = battleSceneStore;
</script>

<template>
  <Scene
    :scene-key="SceneKey.Battle"
    :cls="SceneWithPlugins"
    @create="() => battleStateMachine.setState(StateName.Intro)"
    @update="
      () => {
        const cursorKeys = controls.cursorKeys as Types.Input.Keyboard.CursorKeys;
        battleStateMachine.update();
        if (Input.Keyboard.JustDown(cursorKeys.space)) onPlayerInput(PlayerSpecialInput.Confirm);
        else if (Input.Keyboard.JustDown(cursorKeys.shift)) onPlayerInput(PlayerSpecialInput.Cancel);
        else onPlayerInput(mapCursorKeysToDirection(cursorKeys));
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
