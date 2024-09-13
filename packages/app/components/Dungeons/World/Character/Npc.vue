<script setup lang="ts">
import type { CharacterProps } from "@/components/Dungeons/World/Character/Index.vue";
import type { Npc } from "@/models/dungeons/scene/world/Npc";
import type { Direction } from "grid-engine";

interface NpcProps {
  asset: Npc["asset"];
  id: CharacterProps["id"];
  path: Npc["path"];
  pathIndex: Npc["pathIndex"];
  singleSidedSpritesheetDirection: CharacterProps["singleSidedSpritesheetDirection"];
  walkingAnimationMapping: CharacterProps["walkingAnimationMapping"];
}

const { asset, id, path, pathIndex, singleSidedSpritesheetDirection, walkingAnimationMapping } =
  defineProps<NpcProps>();
const direction = defineModel<Direction | undefined>("direction", { required: true });
const isMoving = defineModel<boolean>("isMoving", { required: true });
</script>

<template>
  <DungeonsWorldCharacter
    :id
    v-model:direction="direction"
    :position="path[pathIndex]"
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
