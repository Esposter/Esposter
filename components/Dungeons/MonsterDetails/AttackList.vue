<script setup lang="ts">
import { MonsterAttackTextStyle } from "@/assets/dungeons/monsterDetails/styles/MonsterAttackTextStyle";
import Text from "@/lib/phaser/components/Text.vue";
import { useMonsterDetailsSceneStore } from "@/store/dungeons/monsterDetails/scene";

const monsterDetailsSceneStore = useMonsterDetailsSceneStore();
const { attackNames } = storeToRefs(monsterDetailsSceneStore);
</script>

<template>
  <Text
    v-for="(text, index) in attackNames"
    :key="text"
    :configuration="{ x: 560, y: 80 * index + 82, text, style: MonsterAttackTextStyle }"
  />
</template>
