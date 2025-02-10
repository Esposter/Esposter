<script setup lang="ts">
import { FileKey } from "#shared/generated/phaser/FileKey";
import { ButtonTextStyle } from "@/assets/dungeons/scene/monsterParty/styles/ButtonTextStyle";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { Input } from "phaser";
import { Container, Image, Text } from "vue-phaserjs";

const monsterPartyOptionGrid = useMonsterPartyOptionGrid();
const onGridClick = useOnGridClick(monsterPartyOptionGrid, () => ({
  x: monsterPartyOptionGrid.position.value.x,
  y: monsterPartyOptionGrid.rowSize - 1,
}));
const isActive = computed(() => monsterPartyOptionGrid.value === PlayerSpecialInput.Cancel);
</script>

<template>
  <Container :configuration="{ x: 883, y: 519 }">
    <Image
      :configuration="{
        origin: 0,
        texture: isActive
          ? FileKey.ThirdPartyKenneysAssetsUIPackBlueButton01
          : FileKey.ThirdPartyKenneysAssetsUIPackBlueButton00,
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
