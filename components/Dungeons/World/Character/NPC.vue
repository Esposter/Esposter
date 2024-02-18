<script setup lang="ts">
import { type Npc } from "@/models/dungeons/world/Npc";
import { type Direction, type Position } from "grid-engine";
// Vue doesn't support complex prop types
// eslint-disable-next-line @typescript-eslint/ban-types
const { asset, ...rest } = defineProps<Omit<Npc, "position" | "direction">>();
const position = defineModel<Position>("position", { required: true });
const direction = defineModel<Direction>("direction", { required: true });
</script>

<template>
  <DungeonsWorldCharacter
    v-model:position="position"
    v-model:direction="direction"
    :sprite-configuration="{ textureKey: asset.key, frame: asset.frame, scale: 4 }"
    :="rest"
  />
</template>
