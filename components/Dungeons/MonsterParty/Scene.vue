<script setup lang="ts">
import Scene from "@/lib/phaser/components/Scene.vue";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { useGameStore } from "@/store/dungeons/game";
import { useInputStore } from "@/store/dungeons/monsterParty/input";

const gameStore = useGameStore();
const { controls } = storeToRefs(gameStore);
const inputStore = useInputStore();
const { onPlayerInput } = inputStore;
</script>

<template>
  <Scene :scene-key="SceneKey.MonsterParty" @update="(scene) => onPlayerInput(controls.getInput(true), scene)">
    <DungeonsMonsterPartyBackground />
    <DungeonsMonsterPartyPanelList />
    <DungeonsMonsterPartyInfoContainer />
    <DungeonsMonsterPartyCancelButton />
  </Scene>
</template>
