<script setup lang="ts">
import { type NPC } from "@/models/dungeons/world/NPC";

const { id, asset, walkingAnimationMapping, startPosition } = defineProps<NPC>();
</script>

<template>
  <DungeonsWorldCharacter
    :id="id"
    :sprite-configuration="{ textureKey: asset.key, frame: asset.frame, scale: 4 }"
    :walking-animation-mapping="walkingAnimationMapping"
    :start-position="startPosition"
  />
</template>
