<script setup lang="ts">
import Scene from "@/lib/phaser/components/Scene.vue";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { useGameStore } from "@/store/dungeons/game";
import { useMonsterPartySceneStore } from "@/store/dungeons/monsterParty/scene";

const gameStore = useGameStore();
const { controls } = storeToRefs(gameStore);
const monsterPartySceneStore = useMonsterPartySceneStore();
const { onPlayerInput } = monsterPartySceneStore;
</script>

<template>
  <Scene :scene-key="SceneKey.MonsterParty" :cls="SceneWithPlugins" @update="onPlayerInput(controls.getInput(true))">
    <DungeonsMonsterPartyBackground />
    <DungeonsMonsterPartyPanelList />
    <DungeonsMonsterPartyInfoContainer />
    <DungeonsMonsterPartyCancelButton />
    <DungeonsUIJoystick />
    <DungeonsUIJoystickConfirmThumb />
  </Scene>
</template>
