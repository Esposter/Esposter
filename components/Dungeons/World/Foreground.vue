<script setup lang="ts">
import Image from "@/lib/phaser/components/Image.vue";
import { ImageKey } from "@/models/dungeons/keys/image/ImageKey";
import { useWorldPlayerStore } from "@/store/dungeons/world/player";

const worldPlayerStore = useWorldPlayerStore();
const { sprite } = storeToRefs(worldPlayerStore);
// Make the foreground have a higher depth than the player for them to hide behind
const depth = computed(() => (sprite.value ? sprite.value.depth + 1 : 0));
</script>

<template>
  <Image :configuration="{ origin: 0, texture: ImageKey.WorldHomeForeground, depth }" />
</template>
