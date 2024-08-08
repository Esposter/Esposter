<script setup lang="ts">
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";

import Scene from "@/lib/phaser/components/Scene.vue";
import { useInputStore } from "@/lib/phaser/store/input";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { getActiveInputResolvers } from "@/services/dungeons/scene/monsterParty/getActiveInputResolvers";

const inputStore = useInputStore();
const { controls } = storeToRefs(inputStore);
const inputResolvers = getActiveInputResolvers();

const update = async (scene: SceneWithPlugins) => {
  const justDownInput = controls.value.getInput(true);
  const input = controls.value.getInput();

  for (const inputResolver of inputResolvers) if (await inputResolver.handleInput(scene, justDownInput, input)) return;
};
</script>

<template>
  <Scene :scene-key="SceneKey.MonsterParty" @update="update">
    <DungeonsMonsterPartyBackground />
    <DungeonsMonsterPartyPanelList />
    <DungeonsMonsterPartyInfoContainer />
    <DungeonsMonsterPartyCancelButton />
    <DungeonsMonsterPartyMenu />
  </Scene>
</template>
