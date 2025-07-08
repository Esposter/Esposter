<script setup lang="ts">
import { ImageKey } from "#shared/models/dungeons/keys/image/ImageKey";
import { useWorldPlayerStore } from "@/store/dungeons/world/player";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";
import { Image } from "vue-phaserjs";

const worldSceneStore = useWorldSceneStore();
const { tilemapKey } = storeToRefs(worldSceneStore);
const texture = computed(() => Object.values(ImageKey).find((k) => k === `World${tilemapKey.value}Foreground`));
const worldPlayerStore = useWorldPlayerStore();
const { sprite } = storeToRefs(worldPlayerStore);
// Make the foreground have a higher depth than the player for them to hide behind
const depth = computed(() => (sprite.value ? sprite.value.depth + 1 : 0));
</script>

<template>
  <Image v-if="texture" :configuration="{ origin: 0, texture, depth }" />
</template>
