<script setup lang="ts">
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { getActiveInputResolvers } from "@/services/dungeons/scene/monsterParty/getActiveInputResolvers";

const activeInputResolvers = getActiveInputResolvers();
const update = useResolveInput(activeInputResolvers);
</script>

<template>
  <DungeonsScene :scene-key="SceneKey.MonsterParty" @update="(scene) => update(scene)">
    <DungeonsMonsterPartyBackground />
    <DungeonsMonsterPartyPanelList />
    <DungeonsMonsterPartyInfoContainer />
    <DungeonsMonsterPartyCancelButton />
    <DungeonsMonsterPartyMenu />
    <DungeonsMonsterPartyMenuConfirmation />
  </DungeonsScene>
</template>
