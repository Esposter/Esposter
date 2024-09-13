<script setup lang="ts">
import type { SceneWithPlugins } from "vue-phaser";

import { getActiveInputResolvers } from "@/services/dungeons/scene/monsterParty/getActiveInputResolvers";
import { useControlsStore } from "@/store/dungeons/controls";
import { SceneKey } from "vue-phaser";

const controlsStore= useControlsStore();
const { controls } = storeToRefs(controlsStore);
const inputResolvers = getActiveInputResolvers();

const update = async (scene: SceneWithPlugins) => {
  const justDownInput = controls.value.getInput(true);
  const input = controls.value.getInput();

  for (const inputResolver of inputResolvers) if (await inputResolver.handleInput(scene, justDownInput, input)) return;
};
</script>

<template>
  <DungeonsScene :scene-key="SceneKey.MonsterParty" @update="update">
    <DungeonsMonsterPartyBackground />
    <DungeonsMonsterPartyPanelList />
    <DungeonsMonsterPartyInfoContainer />
    <DungeonsMonsterPartyCancelButton />
    <DungeonsMonsterPartyMenu />
    <DungeonsMonsterPartyMenuConfirmation />
  </DungeonsScene>
</template>
