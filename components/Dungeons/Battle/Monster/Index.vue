<script setup lang="ts">
import Image from "@/lib/phaser/components/Image.vue";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { BEFORE_DESTROY_SCENE_EVENT_KEY } from "@/lib/phaser/util/constants";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";
import { usePlayerStore } from "@/store/dungeons/battle/player";

interface MonsterProps {
  // By default, this will be the player
  isEnemy?: true;
}

const { isEnemy } = defineProps<MonsterProps>();
const phaserStore = usePhaserStore();
const { sceneKey } = storeToRefs(phaserStore);
const store = isEnemy ? useEnemyStore() : usePlayerStore();
const { initialMonsterPosition } = store;
const { activeMonster, monsterPosition, monsterTween } = storeToRefs(store);

usePhaserListener(`${BEFORE_DESTROY_SCENE_EVENT_KEY}${sceneKey.value}`, () => {
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
