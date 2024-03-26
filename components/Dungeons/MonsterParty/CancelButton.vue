<script setup lang="ts">
import { ButtonTextStyle } from "@/assets/dungeons/monsterParty/styles/ButtonTextStyle";
import Container from "@/lib/phaser/components/Container.vue";
import Image from "@/lib/phaser/components/Image.vue";
import Text from "@/lib/phaser/components/Text.vue";
import { ImageKey } from "@/models/dungeons/keys/image/ImageKey";
</script>

<template>
  <Container :configuration="{ x: 883, y: 519 }">
    <Image
      :configuration="{
        texture: ImageKey.BlueButton,
        origin: 0,
        scaleX: 0.7,
        alpha: 0.7,
      }"
    />
    <Text
      :configuration="{
        x: 66.5,
        y: 20.6,
        text: 'cancel',
        style: ButtonTextStyle,
        origin: 0.5,
      }"
    />
  </Container>
</template>
