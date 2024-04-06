<script setup lang="ts">
import { MenuTextStyle } from "@/assets/dungeons/monsterParty/styles/MenuTextStyle";
import Container from "@/lib/phaser/components/Container.vue";
import Rectangle from "@/lib/phaser/components/Rectangle.vue";
import Text from "@/lib/phaser/components/Text.vue";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { useMonsterPartySceneStore } from "@/store/dungeons/monsterParty/scene";

const phaserStore = usePhaserStore();
const { scene } = storeToRefs(phaserStore);
const monsterPartySceneStore = useMonsterPartySceneStore();
const { optionGrid, infoText } = storeToRefs(monsterPartySceneStore);
const cancelButtonActive = computed(() => optionGrid.value.value === PlayerSpecialInput.Cancel);

watch(
  cancelButtonActive,
  (newCancelButtonActive) => {
    // We will keep info text as a ref as it can be set by other things
    // e.g. when using items
    infoText.value = newCancelButtonActive ? "Go back to previous menu" : "Choose a monster";
  },
  { immediate: true },
);
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
        text: infoText,
        style: MenuTextStyle,
      }"
    />
  </Container>
</template>
