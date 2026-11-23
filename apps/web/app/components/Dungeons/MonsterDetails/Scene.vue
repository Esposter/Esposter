<script setup lang="ts">
import { FileKey } from "#shared/generated/phaser/FileKey";
import { MenuExperienceTextStyle } from "#src/assets/dungeons/scene/monsterDetails/styles/MenuExperienceTextStyle";
import { MenuTextStyle } from "#src/assets/dungeons/scene/monsterDetails/styles/MenuTextStyle";
import { ExperienceLabelTextStyle } from "#src/assets/dungeons/styles/ExperienceLabelTextStyle";
import { SceneKey } from "#src/models/dungeons/keys/SceneKey";
import { getMonsterFileKey } from "#src/services/dungeons/monster/getMonsterFileKey";
import { useControlsStore } from "#src/store/dungeons/controls";
import { useMonsterDetailsSceneStore } from "#src/store/dungeons/monsterDetails/scene";
import { prettify } from "#src/util/text/prettify";
import { NotFoundError } from "@esposter/shared";
import { Image, Text } from "vue-phaserjs";

const controlsStore = useControlsStore();
const { controls } = storeToRefs(controlsStore);
const monsterDetailsSceneStore = useMonsterDetailsSceneStore();
const { onPlayerInput } = monsterDetailsSceneStore;
const { selectedMonster } = storeToRefs(monsterDetailsSceneStore);
// The scene is only launched with a monster selected, so an unset one is a fault in the launch
const monster = computed(() => {
  if (!selectedMonster.value) throw new NotFoundError(SceneKey.MonsterDetails, "selected monster");
  return selectedMonster.value;
});
const { barPercentage, experienceToNextLevel } = useExperience(monster);
const monsterName = computed(() => prettify(monster.value.key));
</script>

<template>
  <DungeonsScene :scene-key="SceneKey.MonsterDetails" @update="onPlayerInput($event, controls.getInput(true))">
    <Image :configuration="{ origin: 0, texture: FileKey.SceneMonsterPartyMonsterDetailsBackground }" />
    <Text :configuration="{ x: 10, text: 'Monster Details', style: { ...MenuTextStyle, fontSize: 48 } }" />
    <Text
      :configuration="{
        x: 20,
        y: 60,
        text: `LV. ${monster.statistics.level}`,
        style: { ...MenuTextStyle, fontSize: 40 },
      }"
    />
    <Text :configuration="{ x: 200, y: 60, text: monsterName, style: { ...MenuTextStyle, fontSize: 40 } }" />
    <Image
      :configuration="{ x: 160, y: 310, originX: 0, originY: 1, texture: getMonsterFileKey(monster.key), scale: 0.7 }"
    />
    <Text :configuration="{ x: 20, y: 340, origin: 0, text: 'Current Exp.', style: MenuExperienceTextStyle }" />
    <Text
      :configuration="{
        x: 516,
        y: 340,
        originX: 1,
        originY: 0,
        text: monster.status.experience.toString(),
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
    <Text :configuration="{ x: 108, y: 392, text: 'EXP', style: ExperienceLabelTextStyle }" />
    <DungeonsUIExperienceBar :position="{ x: 70, y: 200 }" :bar-percentage />
    <DungeonsMonsterDetailsAttackList />
  </DungeonsScene>
</template>
