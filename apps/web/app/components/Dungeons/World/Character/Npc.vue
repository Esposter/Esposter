<script setup lang="ts">
import type { Npc } from "#src/models/dungeons/scene/world/Npc";
import type { Direction } from "grid-engine";

import { takeOne } from "@esposter/shared";

interface Props {
  npc: Npc;
}

const direction = defineModel<Direction | undefined>("direction", { required: true });
const isMoving = defineModel<boolean>("isMoving", { required: true });
defineProps<Props>();
</script>

<template>
  <DungeonsWorldCharacter
    :id="npc.id"
    v-model:direction="direction"
    v-model:is-moving="isMoving"
    :position="takeOne(npc.path, npc.pathIndex)"
    :sprite-configuration="{ texture: npc.asset.key, frame: npc.asset.frame, scale: 4 }"
    :walking-animation-mapping="npc.walkingAnimationMapping"
    :single-sided-spritesheet-direction="npc.singleSidedSpritesheetDirection"
    :speed="2"
  />
</template>
