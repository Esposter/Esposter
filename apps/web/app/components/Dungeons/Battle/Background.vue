<script setup lang="ts">
import { ImageKey } from "#shared/models/dungeons/keys/image/ImageKey";
import { Image } from "vue-phaserjs";

const texture = ref(ImageKey.BattleForestBackground);
</script>

<template>
  <Image :configuration="{ texture, origin: 0 }" />
</template>
