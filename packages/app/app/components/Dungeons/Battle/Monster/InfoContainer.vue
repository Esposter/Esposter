<script setup lang="ts">
import { ImageKey } from "#shared/models/dungeons/keys/image/ImageKey";
import { ExperienceLabelTextStyle } from "@/assets/dungeons/styles/ExperienceLabelTextStyle";
import { HealthLabelTextStyle } from "@/assets/dungeons/styles/HealthLabelTextStyle";
import { BarType } from "@/models/dungeons/UI/bar/BarType";
import { phaserEventEmitter } from "@/services/phaser/events";
import { prettify } from "@/util/text/prettify";
import { Container, Image, Text } from "vue-phaserjs";

interface Props {
  isEnemy?: true;
}

defineSlots<{ default: () => VNode }>();
const { isEnemy } = defineProps<Props>();
const battleMonsterStore = useBattleMonsterStore(isEnemy);
const { initialMonsterInfoContainerPosition } = battleMonsterStore;
const { activeMonster, monsterInfoContainerPosition, monsterInfoContainerTween } = storeToRefs(battleMonsterStore);
const monsterName = computed(() => prettify(activeMonster.value.key));
const nameDisplayWidth = ref<number>();
const { barPercentage: experienceBarPercentage } = useExperience(activeMonster);

onUnmounted(() => {
  monsterInfoContainerPosition.value = { ...initialMonsterInfoContainerPosition };
});
</script>

<template>
  <Container :configuration="{ ...monsterInfoContainerPosition, tween: monsterInfoContainerTween }">
    <Image :configuration="{ origin: 0, texture: ImageKey.HealthBarBackground, scaleY: isEnemy ? 0.8 : undefined }" />
    <Text
      :configuration="{
        x: 30,
        y: 20,
        text: monsterName,
        style: {
          color: '#7e3d3f',
          fontSize: 32,
        },
        displayWidth: nameDisplayWidth,
      }"
      @update:display-width="nameDisplayWidth = $event"
    />
    <Text
      :configuration="{
        x: 35 + (nameDisplayWidth ?? 0),
        y: 23,
        text: `L${activeMonster.statistics.level}`,
        style: {
          color: '#ed474b',
          fontSize: 28,
        },
      }"
    />
    <Text
      :configuration="{
        x: 30,
        y: 55,
        text: 'HP',
        style: HealthLabelTextStyle,
      }"
    />
    <DungeonsUIBarContainer
      :type="BarType.Health"
      :position="{ x: 34, y: 34 }"
      :bar-percentage="(activeMonster.status.health / activeMonster.statistics.maxHealth) * 100"
    />
    <template v-if="!isEnemy">
      <Text
        :configuration="{
          x: 443,
          y: 80,
          originX: 1,
          originY: 0,
          text: `${activeMonster.status.health}/${activeMonster.statistics.maxHealth}`,
          style: {
            color: '#7e3d3f',
            fontSize: 16,
          },
        }"
      />
      <Text
        :configuration="{
          x: 30,
          y: 100,
          text: 'EXP',
          style: ExperienceLabelTextStyle,
        }"
      />
      <DungeonsUIExperienceBar
        :position="{ x: 34, y: 54 }"
        :bar-percentage="experienceBarPercentage"
        @level-up="phaserEventEmitter.emit('levelUp', activeMonster, $event)"
      />
    </template>
  </Container>
</template>
