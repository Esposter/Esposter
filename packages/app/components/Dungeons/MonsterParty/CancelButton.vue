<script setup lang="ts">
import { ButtonTextStyle } from "@/assets/dungeons/scene/monsterParty/styles/ButtonTextStyle";
import Container from "@/lib/phaser/components/Container.vue";
import Image from "@/lib/phaser/components/Image.vue";
import Text from "@/lib/phaser/components/Text.vue";
import { ImageKey } from "@/models/dungeons/keys/image/ImageKey";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { useMonsterPartySceneStore } from "@/store/dungeons/monsterParty/scene";
import { Input } from "phaser";

const monsterPartySceneStore = useMonsterPartySceneStore();
const { monsterPartyOptionGrid } = storeToRefs(monsterPartySceneStore);
const onGridClick = useOnGridClick(monsterPartyOptionGrid, () => ({
  x: monsterPartyOptionGrid.value.position.x,
  y: monsterPartyOptionGrid.value.rowSize - 1,
}));
const isActive = computed(() => monsterPartyOptionGrid.value.value === PlayerSpecialInput.Cancel);
</script>

<template>
  <Container :configuration="{ x: 883, y: 519 }">
    <Image
      :configuration="{
        origin: 0,
        texture: isActive ? ImageKey.BlueButtonSelected : ImageKey.BlueButton,
        scaleX: 0.7,
        alpha: isActive ? 1 : 0.7,
      }"
      @[`${Input.Events.GAMEOBJECT_POINTER_UP}`]="onGridClick"
    />
    <Text
      :configuration="{
        x: 66.5,
        y: 20.6,
        origin: 0.5,
        text: PlayerSpecialInput.Cancel,
        style: ButtonTextStyle,
      }"
    />
  </Container>
</template>
