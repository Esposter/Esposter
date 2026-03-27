<script setup lang="ts">
import { ImageKeys } from "#shared/models/dungeons/keys/image/ImageKey";
import type { ImageKey } from "#shared/models/dungeons/keys/image/ImageKey";
import { useWorldPlayerStore } from "@/store/dungeons/world/player";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";
import { Image } from "vue-phaserjs";

const worldSceneStore = useWorldSceneStore();
const { tilemapKey } = storeToRefs(worldSceneStore);
const foregroundTextureKey = computed(() => `World${tilemapKey.value}Foreground` as ImageKey);
const texture = computed(() => (ImageKeys.has(foregroundTextureKey.value) ? foregroundTextureKey.value : undefined));
const worldPlayerStore = useWorldPlayerStore();
const { sprite } = storeToRefs(worldPlayerStore);
// Make the foreground have a higher depth than the player for them to hide behind
const depth = computed(() => (sprite.value ? sprite.value.depth + 1 : 0));
</script>

<template>
  <Image v-if="texture" :configuration="{ origin: 0, texture, depth }" />
</template>
