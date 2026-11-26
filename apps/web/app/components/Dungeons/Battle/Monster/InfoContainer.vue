<script setup lang="ts">
import { DungeonsKeys } from "#shared/generated/hostedAssetKeys/dungeonsKeys";
import { ExperienceLabelTextStyle } from "#src/assets/dungeons/styles/ExperienceLabelTextStyle";
import { HealthLabelTextStyle } from "#src/assets/dungeons/styles/HealthLabelTextStyle";
import { useBattleMonsterStore } from "#src/composables/dungeons/scene/battle/monster/useBattleMonsterStore";
import { BarType } from "#src/models/dungeons/UI/bar/BarType";
import { getHealthBarPercentage } from "#src/services/dungeons/monster/getHealthBarPercentage";
import { phaserEventEmitter } from "#src/services/phaser/phaserEventEmitter";
import { prettify } from "#src/util/text/prettify";
import { NotFoundError } from "@esposter/shared";
import { Container, Image, Text } from "vue-phaserjs";

interface Props {
  isEnemy?: true | undefined;
}

const { isEnemy } = defineProps<Props>();
const battleMonsterStore = useBattleMonsterStore(isEnemy);
const { activeMonster, monsterInfoContainerPosition, monsterInfoContainerTween } = storeToRefs(battleMonsterStore);
// The container is only shown for a battle with a monster in it, so an unset one is a fault in the battle
const monster = computed(() => {
  if (!activeMonster.value) throw new NotFoundError("InfoContainer", "active monster");
  return activeMonster.value;
});
const monsterName = computed(() => prettify(monster.value.key));
const nameDisplayWidth = ref<number>();
const { barPercentage: experienceBarPercentage } = useExperience(monster);
</script>

<template>
  <Container :configuration="{ ...monsterInfoContainerPosition, tween: monsterInfoContainerTween }">
    <Image
      :configuration="{
        origin: 0,
        texture: DungeonsKeys.ThirdPartyKenneysAssetsUISpaceExpansionCustomUI,
        scaleY: isEnemy ? 0.8 : undefined,
      }"
    />
    <Text
      :configuration="
        { x: 30, y: 20, text: monsterName, style: { color: '#7e3d3f', fontSize: 32 }, displayWidth: nameDisplayWidth }
      "
      @update:display-width="nameDisplayWidth = $event"
    />
    <Text
      :configuration="{
        x: 35 + (nameDisplayWidth ?? 0),
        y: 23,
        text: `L${monster.statistics.level}`,
        style: { color: '#ed474b', fontSize: 28 },
      }"
    />
    <Text :configuration="{ x: 30, y: 55, text: 'HP', style: HealthLabelTextStyle }" />
    <DungeonsUIBarContainer
      :type="BarType.Health"
      :position="{ x: 34, y: 34 }"
      :bar-percentage="getHealthBarPercentage(monster)"
    />
    <template v-if="!isEnemy">
      <Text
        :configuration="{
          x: 443,
          y: 80,
          originX: 1,
          originY: 0,
          text: `${monster.status.health}/${monster.statistics.maxHealth}`,
          style: { color: '#7e3d3f', fontSize: 16 },
        }"
      />
      <Text :configuration="{ x: 30, y: 100, text: 'EXP', style: ExperienceLabelTextStyle }" />
      <DungeonsUIExperienceBar
        :position="{ x: 34, y: 54 }"
        :bar-percentage="experienceBarPercentage"
        @level-up="phaserEventEmitter.emit('levelUp', monster, $event)"
      />
    </template>
  </Container>
</template>
