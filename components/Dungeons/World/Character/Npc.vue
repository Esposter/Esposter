<script setup lang="ts">
import { type CharacterProps } from "@/components/Dungeons/World/Character/Index.vue";
import { type Npc } from "@/models/dungeons/world/Npc";
import { type Direction, type Position } from "grid-engine";

interface NpcProps
  extends Pick<Npc, "asset">,
    Pick<CharacterProps, "characterId" | "walkingAnimationMapping" | "singleSidedSpritesheetDirection"> {}

const { asset, characterId, walkingAnimationMapping, singleSidedSpritesheetDirection } = defineProps<NpcProps>();
const position = defineModel<Position>("position", { required: true });
const direction = defineModel<Direction>("direction", { required: true });
</script>

<template>
  <DungeonsWorldCharacter
    v-model:position="position"
    v-model:direction="direction"
    :character-id="characterId"
    :sprite-configuration="{ textureKey: asset.key, frame: asset.frame, scale: 4 }"
    :walking-animation-mapping="walkingAnimationMapping"
    :single-sided-spritesheet-direction="singleSidedSpritesheetDirection"
  />
</template>
