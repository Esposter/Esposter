<script setup lang="ts">
import { FileKey } from "#shared/generated/phaser/FileKey";
import { BarType } from "@/models/dungeons/UI/bar/BarType";
import { phaserEventEmitter } from "@/services/phaser/events";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";
import { useBattlePlayerStore } from "@/store/dungeons/battle/player";
import { prettify } from "@/util/text/prettify";
import { Container, Image, Text } from "vue-phaserjs";

interface InfoContainerProps {
  isEnemy: boolean;
}

defineSlots<{ default: (props: Record<string, never>) => unknown }>();
const { isEnemy } = defineProps<InfoContainerProps>();
const store = isEnemy ? useEnemyStore() : useBattlePlayerStore();
const { initialMonsterInfoContainerPosition } = store;
const { activeMonster, monsterInfoContainerPosition, monsterInfoContainerTween } = storeToRefs(store);
const scaleY = computed(() => (isEnemy ? 0.8 : undefined));
const nameDisplayWidth = ref<number>();
const levelX = computed(() => 35 + (nameDisplayWidth.value ?? 0));
const healthBarPercentage = computed(() => (activeMonster.value.status.hp / activeMonster.value.stats.maxHp) * 100);
const { barPercentage: experienceBarPercentage } = useExperience(activeMonster);

onUnmounted(() => {
  monsterInfoContainerPosition.value = { ...initialMonsterInfoContainerPosition };
});
</script>

<template>
  <Container :configuration="{ ...monsterInfoContainerPosition, tween: monsterInfoContainerTween }">
    <Image :configuration="{ origin: 0, texture: FileKey.ThirdPartyKenneysAssetsUISpaceExpansionCustomUI, scaleY }" />
    <Text
      :configuration="{
        x: 30,
        y: 20,
        text: prettify(activeMonster.key),
        style: {
          color: '#7e3d3f',
          fontSize: 32,
        },
        displayWidth: nameDisplayWidth,
      }"
      @update:display-width="(value) => (nameDisplayWidth = value)"
    />
    <Text
      :configuration="{
        x: levelX,
        y: 23,
        text: `L${activeMonster.stats.level}`,
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
        style: {
          color: '#ff6505',
          fontSize: 24,
          fontStyle: 'italic',
        },
      }"
    />
    <DungeonsUIBarContainer :type="BarType.Health" :position="{ x: 34, y: 34 }" :bar-percentage="healthBarPercentage" />
    <template v-if="!isEnemy">
      <Text
        :configuration="{
          x: 443,
          y: 80,
          originX: 1,
          originY: 0,
          text: `${activeMonster.status.hp}/${activeMonster.stats.maxHp}`,
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
          style: {
            color: '#6505ff',
            fontSize: 14,
            fontStyle: 'italic',
          },
        }"
      />
      <DungeonsUIExperienceBar
        :position="{ x: 34, y: 54 }"
        :bar-percentage="experienceBarPercentage"
        @level-up="(onComplete) => phaserEventEmitter.emit('levelUp', activeMonster, onComplete)"
      />
    </template>
  </Container>
</template>
