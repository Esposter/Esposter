<script setup lang="ts">
import { ButtonTextStyle } from "@/assets/dungeons/monsterParty/styles/ButtonTextStyle";
import Container from "@/lib/phaser/components/Container.vue";
import Image from "@/lib/phaser/components/Image.vue";
import Text from "@/lib/phaser/components/Text.vue";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { ImageKey } from "@/models/dungeons/keys/image/ImageKey";
import { useGameStore } from "@/store/dungeons/game";
import { useMonsterPartySceneStore } from "@/store/dungeons/monsterParty/scene";
import { Input } from "phaser";

const gameStore = useGameStore();
const { controls } = storeToRefs(gameStore);
const monsterPartySceneStore = useMonsterPartySceneStore();
const { optionGrid } = storeToRefs(monsterPartySceneStore);
const isActive = computed(() => optionGrid.value.value === PlayerSpecialInput.Cancel);
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
      @[`${Input.Events.GAMEOBJECT_POINTER_UP}`]="
        () => {
          if (isActive) {
            controls.setInput(PlayerSpecialInput.Cancel);
            return;
          }

          optionGrid.position.y = optionGrid.rowSize - 1;
        }
      "
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
