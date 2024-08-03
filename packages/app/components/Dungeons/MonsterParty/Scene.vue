<script setup lang="ts">
import Scene from "@/lib/phaser/components/Scene.vue";
import { useInputStore } from "@/lib/phaser/store/input";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { useMonsterPartyInputStore } from "@/store/dungeons/monsterParty/input";

const inputStore = useInputStore();
const { controls } = storeToRefs(inputStore);
const monsterPartyInputStore = useMonsterPartyInputStore();
const { onPlayerInput } = monsterPartyInputStore;
</script>

<template>
  <Scene :scene-key="SceneKey.MonsterParty" @update="(scene) => onPlayerInput(scene, controls.getInput(true))">
    <DungeonsMonsterPartyBackground />
    <DungeonsMonsterPartyPanelList />
    <DungeonsMonsterPartyInfoContainer />
    <DungeonsMonsterPartyCancelButton />
    <DungeonsMonsterPartyMenu />
  </Scene>
</template>
