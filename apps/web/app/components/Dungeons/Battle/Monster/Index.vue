<script setup lang="ts">
import { useBattleMonsterStore } from "#src/composables/dungeons/scene/battle/monster/useBattleMonsterStore";
import { MonsterKeyFileKeyMap } from "#src/services/dungeons/monster/MonsterKeyFileKeyMap";
import { Image } from "vue-phaserjs";

interface Props {
  // By default, this will be the player
  isEnemy?: true | undefined;
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
    v-if="activeMonster"
    :configuration="{
      ...monsterPosition,
      texture: MonsterKeyFileKeyMap[activeMonster.key],
      flipX: !isEnemy,
      tween: monsterTween,
    }"
  />
  <DungeonsBattleMonsterAvailableListContainer v-if="!isEnemy" />
  <DungeonsBattleMonsterInfoContainer v-if="activeMonster" :is-enemy />
</template>
