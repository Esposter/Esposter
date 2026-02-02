<script setup lang="ts">
import { useEnemyStore } from "@/store/dungeons/battle/enemy";
import { useBattlePlayerStore } from "@/store/dungeons/battle/player";
import { Image } from "vue-phaserjs";

interface MonsterProps {
  // By default, this will be the player
  isEnemy?: boolean;
}

const { isEnemy = false } = defineProps<MonsterProps>();
const store = isEnemy ? useEnemyStore() : useBattlePlayerStore();
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
