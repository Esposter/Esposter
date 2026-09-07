<script setup lang="ts">
import { Image } from "vue-phaserjs";

interface Props {
  // By default, this will be the player
  isEnemy?: true;
}

const { isEnemy } = defineProps<Props>();
const battleMonsterStore = useBattleMonsterStore(isEnemy);
const { initialMonsterPosition } = battleMonsterStore;
const { activeMonster, monsterPosition, monsterTween } = storeToRefs(battleMonsterStore);

onUnmounted(() => {
  monsterPosition.value = { ...initialMonsterPosition };
});
</script>

<template>
  <Image
    :configuration="{
      ...monsterPosition,
      texture: activeMonster.asset.key,
      frame: activeMonster.asset.frame,
      flipX: !isEnemy,
      tween: monsterTween,
    }"
  />
  <DungeonsBattleMonsterAvailableListContainer v-if="!isEnemy" />
  <DungeonsBattleMonsterInfoContainer :is-enemy />
</template>
