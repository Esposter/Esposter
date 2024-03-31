<script setup lang="ts">
import { MenuTextStyle } from "@/assets/dungeons/monsterDetails/styles/MenuTextStyle";
import Image from "@/lib/phaser/components/Image.vue";
import Scene from "@/lib/phaser/components/Scene.vue";
import Text from "@/lib/phaser/components/Text.vue";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { ImageKey } from "@/models/dungeons/keys/image/ImageKey";
import { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { useGameStore } from "@/store/dungeons/game";
import { useMonsterDetailsSceneStore } from "@/store/dungeons/monsterDetails/scene";

const gameStore = useGameStore();
const { controls } = storeToRefs(gameStore);
const monsterDetailsSceneStore = useMonsterDetailsSceneStore();
const { onPlayerInput } = monsterDetailsSceneStore;
const { monster } = storeToRefs(monsterDetailsSceneStore);
</script>

<template>
  <Scene :scene-key="SceneKey.MonsterDetails" :cls="SceneWithPlugins" @update="onPlayerInput(controls.getInput(true))">
    <Image :configuration="{ texture: ImageKey.MonsterDetailsBackground, origin: 0 }" />
    <Text :configuration="{ x: 10, text: 'Monster Details', style: { ...MenuTextStyle, fontSize: 48 } }" />
    <Text
      :configuration="{ x: 20, y: 60, text: `LV. ${monster.currentLevel}`, style: { ...MenuTextStyle, fontSize: 40 } }"
    />
    <Text :configuration="{ x: 200, y: 60, text: monster.name, style: { ...MenuTextStyle, fontSize: 40 } }" />
    <Image :configuration="{ x: 160, y: 310, texture: monster.asset.key, originX: 0, originY: 1, scale: 0.7 }" />
    <DungeonsMonsterDetailsAttackList />
  </Scene>
</template>
