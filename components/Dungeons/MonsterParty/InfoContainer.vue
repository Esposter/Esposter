<script setup lang="ts">
import { MenuTextStyle } from "@/assets/dungeons/monsterParty/styles/MenuTextStyle";
import Container from "@/lib/phaser/components/Container.vue";
import Rectangle from "@/lib/phaser/components/Rectangle.vue";
import Text from "@/lib/phaser/components/Text.vue";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { useMonsterPartySceneStore } from "@/store/dungeons/monsterParty/scene";

const phaserStore = usePhaserStore();
const { scene } = storeToRefs(phaserStore);
const monsterPartySceneStore = useMonsterPartySceneStore();
const { optionGrid } = storeToRefs(monsterPartySceneStore);
const cancelButtonActive = computed(() => optionGrid.value.position.y === optionGrid.value.rowSize - 1);
</script>

<template>
  <Container :configuration="{ x: 4, y: scene.scale.height - 69 }">
    <Rectangle
      :configuration="{
        origin: 0,
        width: 867,
        height: 65,
        fillColor: 0xede4f3,
        strokeStyle: [8, 0x905ac2],
      }"
    />
    <Text
      :configuration="{
        x: 15,
        y: 14,
        text: cancelButtonActive ? 'Go back to previous menu' : 'Choose a monster',
        style: MenuTextStyle,
      }"
    />
  </Container>
</template>
