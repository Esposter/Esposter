<script setup lang="ts">
import { DungeonsKeys } from "#shared/generated/hostedAssetKeys/dungeonsKeys";
import { Image } from "vue-phaserjs";

const texture = DungeonsKeys.SceneBattleForestBackground;
</script>

<template>
  <Image :configuration="{ texture, origin: 0 }" />
</template>
