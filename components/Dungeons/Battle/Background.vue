<script setup lang="ts">
import Image from "@/lib/phaser/components/Image.vue";
import { ImageKey } from "@/models/dungeons/keys/image/ImageKey";

const textureKey = ref(ImageKey.BattleForestBackground);
</script>

<template>
  <Image :configuration="{ textureKey, origin: 0 }" />
</template>
