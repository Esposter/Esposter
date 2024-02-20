<script setup lang="ts">
import { type CharacterProps } from "@/components/Dungeons/World/Character/Index.vue";
import { type Npc } from "@/models/dungeons/world/Npc";
import { type Direction } from "grid-engine";

interface NpcProps {
  asset: Npc["asset"];
  path: Npc["path"];
  pathIndex: Npc["pathIndex"];
  characterId: CharacterProps["characterId"];
  walkingAnimationMapping: CharacterProps["walkingAnimationMapping"];
  singleSidedSpritesheetDirection: CharacterProps["singleSidedSpritesheetDirection"];
}

const { asset, path, pathIndex, characterId, walkingAnimationMapping, singleSidedSpritesheetDirection } =
  defineProps<NpcProps>();
const direction = defineModel<Direction>("direction", { required: true });
const isMoving = defineModel<boolean>("isMoving", { required: true });
</script>

<template>
  <DungeonsWorldCharacter
    v-model:direction="direction"
    :position="path[pathIndex]"
    :character-id="characterId"
    :sprite-configuration="{ textureKey: asset.key, frame: asset.frame, scale: 4 }"
    :walking-animation-mapping="walkingAnimationMapping"
    :single-sided-spritesheet-direction="singleSidedSpritesheetDirection"
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
