<script setup lang="ts">
import { SceneKey } from "#src/models/dungeons/keys/SceneKey";
import { getActiveInputResolvers } from "#src/services/dungeons/scene/monsterParty/getActiveInputResolvers";

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
