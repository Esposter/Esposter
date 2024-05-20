<script setup lang="ts">
import Image from "@/lib/phaser/components/Image.vue";
import { ImageKey } from "@/models/dungeons/keys/image/ImageKey";

const texture = ref(ImageKey.BattleForestBackground);
</script>

<template>
  <Image :configuration="{ texture, origin: 0 }" />
</template>
