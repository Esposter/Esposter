<script setup lang="ts">
import { FileKey } from "#shared/generated/phaser/FileKey";
import { useWorldPlayerStore } from "@/store/dungeons/world/player";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";
import { Image } from "vue-phaserjs";

const worldSceneStore = useWorldSceneStore();
const { tilemapKey } = storeToRefs(worldSceneStore);
const texture = computed(() => Object.values(FileKey).find((k) => k === `SceneWorld${tilemapKey.value}Foreground`));
const worldPlayerStore = useWorldPlayerStore();
const { sprite } = storeToRefs(worldPlayerStore);
// Foreground sits above the player so they can hide behind it.
const depth = computed(() => (sprite.value ? sprite.value.depth + 1 : 0));
</script>

<template>
  <Image v-if="texture" :configuration="{ origin: 0, texture, depth }" />
</template>
