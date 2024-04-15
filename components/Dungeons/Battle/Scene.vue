<script setup lang="ts">
import Scene from "@/lib/phaser/components/Scene.vue";
import { onStopped } from "@/lib/phaser/hooks/onStopped";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { SoundKey } from "@/models/dungeons/keys/SoundKey";
import { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/battle/battleStateMachine";
import { useBattleSceneStore } from "@/store/dungeons/battle/scene";
import { useGameStore } from "@/store/dungeons/game";

const gameStore = useGameStore();
const { controls } = storeToRefs(gameStore);
const battleSceneStore = useBattleSceneStore();
const { onPlayerInput } = battleSceneStore;

onStopped(() => {
  battleStateMachine.setState(null);
});
</script>

<template>
  <Scene
    :scene-key="SceneKey.Battle"
    :cls="SceneWithPlugins"
    @create="
      () => {
        useDungeonsBackgroundMusic(SoundKey.DecisiveBattle);
        battleStateMachine.setState(StateName.Intro);
      }
    "
    @update="
      () => {
        battleStateMachine.update();
        onPlayerInput(controls.getInput());
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
