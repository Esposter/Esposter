<script setup lang="ts">
import Image from "@/lib/phaser/components/Image.vue";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";
import { useBattlePlayerStore } from "@/store/dungeons/battle/player";

interface MonsterProps {
  // By default, this will be the player
  isEnemy?: true;
}

const { isEnemy } = defineProps<MonsterProps>();
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
  <DungeonsBattleMonsterInfoContainer :is-enemy="isEnemy" />
</template>
