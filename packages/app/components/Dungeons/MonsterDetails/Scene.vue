<script setup lang="ts">
import { MenuExperienceTextStyle } from "@/assets/dungeons/scene/monsterDetails/styles/MenuExperienceTextStyle";
import { MenuTextStyle } from "@/assets/dungeons/scene/monsterDetails/styles/MenuTextStyle";
import Image from "@/lib/phaser/components/Image.vue";
import Scene from "@/lib/phaser/components/Scene.vue";
import Text from "@/lib/phaser/components/Text.vue";
import { useInputStore } from "@/lib/phaser/store/input";
import { ImageKey } from "@/models/dungeons/keys/image/ImageKey";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { useMonsterDetailsSceneStore } from "@/store/dungeons/monsterDetails/scene";
import { prettifyName } from "@/util/text/prettifyName";

const inputStore = useInputStore();
const { controls } = storeToRefs(inputStore);
const monsterDetailsSceneStore = useMonsterDetailsSceneStore();
const { onPlayerInput } = monsterDetailsSceneStore;
const { selectedMonster } = storeToRefs(monsterDetailsSceneStore);
const { barPercentage, experienceToNextLevel } = useExperience(selectedMonster);
</script>

<template>
  <Scene :scene-key="SceneKey.MonsterDetails" @update="(scene) => onPlayerInput(scene, controls.getInput(true))">
    <Image :configuration="{ origin: 0, texture: ImageKey.MonsterDetailsBackground }" />
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
        text: prettifyName(selectedMonster.key),
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
    <DungeonsUIExperienceBar :position="{ x: 70, y: 200 }" :bar-percentage="barPercentage" />
    <DungeonsMonsterDetailsAttackList />
  </Scene>
</template>
