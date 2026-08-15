<script setup lang="ts">
import { Image } from "vue-phaserjs";

interface MonsterProps {
  // By default, this will be the player
  isEnemy?: true;
}

const { isEnemy } = defineProps<MonsterProps>();
const store = useBattleMonsterStore(isEnemy);
const { initialMonsterPosition } = store;
const { activeMonster, monsterPosition, monsterTween } = storeToRefs(store);

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
