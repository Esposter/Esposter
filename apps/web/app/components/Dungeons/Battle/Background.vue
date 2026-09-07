<script setup lang="ts">
import { FileKey } from "#shared/generated/phaser/FileKey";
import { Image } from "vue-phaserjs";

const texture = ref(FileKey.SceneBattleForestBackground);
</script>

<template>
  <Image :configuration="{ texture, origin: 0 }" />
</template>
