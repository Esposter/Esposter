<script setup lang="ts">
import { MenuTextStyle } from "@/assets/dungeons/monsterParty/styles/MenuTextStyle";
import Container from "@/lib/phaser/components/Container.vue";
import Rectangle from "@/lib/phaser/components/Rectangle.vue";
import Text from "@/lib/phaser/components/Text.vue";
import { usePhaserStore } from "@/lib/phaser/store/phaser";

const phaserStore = usePhaserStore();
const { scene } = storeToRefs(phaserStore);
</script>

<template>
  <Container :configuration="{ x: 4, y: scene.scale.height - 69 }">
    <Rectangle
      :configuration="{
        width: 867,
        height: 65,
        origin: 0,
        fillColor: 0xede4f3,
        strokeStyle: [8, 0x905ac2],
      }"
    />
    <Text
      :configuration="{
        x: 15,
        y: 14,
        text: '',
        style: MenuTextStyle,
      }"
    />
  </Container>
</template>
