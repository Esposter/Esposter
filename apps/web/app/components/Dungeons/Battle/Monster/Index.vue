<script setup lang="ts">
import { MonsterKeyFileKeyMap } from "@/services/dungeons/monster/MonsterKeyFileKeyMap";
import { Image } from "vue-phaserjs";

interface Props {
  // By default, this will be the player
  isEnemy?: true;
}

const { isEnemy } = defineProps<Props>();
const battleMonsterStore = useBattleMonsterStore(isEnemy);
const { resetMonsterPositions } = battleMonsterStore;
const { activeMonster, monsterPosition, monsterTween } = storeToRefs(battleMonsterStore);

onUnmounted(() => {
  resetMonsterPositions();
});
</script>

<template>
  <Image
    :configuration="{
      ...monsterPosition,
      texture: MonsterKeyFileKeyMap[activeMonster.key],
      flipX: !isEnemy,
      tween: monsterTween,
    }"
  />
  <DungeonsBattleMonsterAvailableListContainer v-if="!isEnemy" />
  <DungeonsBattleMonsterInfoContainer :is-enemy />
</template>
