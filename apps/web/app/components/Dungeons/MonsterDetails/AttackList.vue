<script setup lang="ts">
import { MonsterAttackTextStyle } from "@/assets/dungeons/scene/monsterDetails/styles/MonsterAttackTextStyle";
import { useMonsterDetailsSceneStore } from "@/store/dungeons/monsterDetails/scene";
import { Text } from "vue-phaserjs";

const monsterDetailsSceneStore = useMonsterDetailsSceneStore();
const { attackNames } = storeToRefs(monsterDetailsSceneStore);
</script>

<template>
  <Text
    v-for="(text, index) of attackNames"
    :key="text"
    :configuration="{ x: 560, y: 80 * index + 82, text, style: MonsterAttackTextStyle }"
  />
</template>
