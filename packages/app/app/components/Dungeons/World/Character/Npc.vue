<script setup lang="ts">
import type { CharacterProps } from "@/components/Dungeons/World/Character/CharacterProps";
import type { Npc } from "@/models/dungeons/scene/world/Npc";
import type { Direction } from "grid-engine";

import { takeOne } from "@esposter/shared";

interface Props {
  asset: Npc["asset"];
  id: CharacterProps["id"];
  path: Npc["path"];
  pathIndex: Npc["pathIndex"];
  singleSidedSpritesheetDirection: CharacterProps["singleSidedSpritesheetDirection"];
  walkingAnimationMapping: CharacterProps["walkingAnimationMapping"];
}

const direction = defineModel<Direction | undefined>("direction", { required: true });
const isMoving = defineModel<boolean>("isMoving", { required: true });
const { asset, id, path, pathIndex, singleSidedSpritesheetDirection, walkingAnimationMapping } = defineProps<Props>();
</script>

<template>
  <DungeonsWorldCharacter
    :id
    v-model:direction="direction"
    :position="takeOne(path, pathIndex)"
    :sprite-configuration="{ texture: asset.key, frame: asset.frame, scale: 4 }"
    :walking-animation-mapping
    :single-sided-spritesheet-direction
    :speed="2"
    :on-movement-started="
      () => {
        isMoving = true;
      }
    "
    :on-movement-stopped="
      () => {
        isMoving = false;
      }
    "
  />
</template>
