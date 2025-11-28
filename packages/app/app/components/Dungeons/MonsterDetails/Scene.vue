<script setup lang="ts">
<<<<<<< HEAD
import { FileKey } from "#shared/generated/phaser/FileKey";
=======
import { ImageKey } from "#shared/models/dungeons/keys/image/ImageKey";
import { SceneKey } from "#shared/models/dungeons/keys/SceneKey";
>>>>>>> main
import { MenuExperienceTextStyle } from "@/assets/dungeons/scene/monsterDetails/styles/MenuExperienceTextStyle";
import { MenuTextStyle } from "@/assets/dungeons/scene/monsterDetails/styles/MenuTextStyle";
import { useControlsStore } from "@/store/dungeons/controls";
import { useMonsterDetailsSceneStore } from "@/store/dungeons/monsterDetails/scene";
import { prettify } from "@/util/text/prettify";
import { Image, Text } from "vue-phaserjs";

const controlsStore = useControlsStore();
const { controls } = storeToRefs(controlsStore);
const monsterDetailsSceneStore = useMonsterDetailsSceneStore();
const { onPlayerInput } = monsterDetailsSceneStore;
const { selectedMonster } = storeToRefs(monsterDetailsSceneStore);
const { barPercentage, experienceToNextLevel } = useExperience(selectedMonster);
</script>

<template>
  <DungeonsScene :scene-key="SceneKey.MonsterDetails" @update="onPlayerInput($event, controls.getInput(true))">
    <Image :configuration="{ origin: 0, texture: FileKey.SceneMonsterPartyMonsterDetailsBackground }" />
    <Text :configuration="{ x: 10, text: 'Monster Details', style: { ...MenuTextStyle, fontSize: 48 } }" />
    <Text
      :configuration="{
        x: 20,
        y: 60,
        text: `LV. ${selectedMonster.stats.level}`,
        style: { ...MenuTextStyle, fontSize: 40 },
      }"
    />
    <Text
      :configuration="{
        x: 200,
        y: 60,
        text: prettify(selectedMonster.key),
        style: { ...MenuTextStyle, fontSize: 40 },
      }"
    />
    <Image
      :configuration="{ x: 160, y: 310, originX: 0, originY: 1, texture: selectedMonster.asset.key, scale: 0.7 }"
    />
    <Text :configuration="{ x: 20, y: 340, origin: 0, text: 'Current Exp.', style: MenuExperienceTextStyle }" />
    <Text
      :configuration="{
        x: 516,
        y: 340,
        originX: 1,
        originY: 0,
        text: selectedMonster.status.exp.toString(),
        style: MenuExperienceTextStyle,
      }"
    />
    <Text :configuration="{ x: 20, y: 365, origin: 0, text: 'Exp. to next level', style: MenuExperienceTextStyle }" />
    <Text
      :configuration="{
        x: 516,
        y: 365,
        originX: 1,
        originY: 0,
        text: experienceToNextLevel.toString(),
        style: MenuExperienceTextStyle,
      }"
    />
    <Text
      :configuration="{
        x: 108,
        y: 392,
        text: 'EXP',
        style: {
          color: '#6505ff',
          fontSize: 14,
          fontStyle: 'italic',
        },
      }"
    />
    <DungeonsUIExperienceBar :position="{ x: 70, y: 200 }" :bar-percentage />
    <DungeonsMonsterDetailsAttackList />
  </DungeonsScene>
</template>
