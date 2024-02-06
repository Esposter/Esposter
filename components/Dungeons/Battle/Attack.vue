<script setup lang="ts">
import Sprite from "@/lib/phaser/components/Sprite.vue";
import { type SpriteConfiguration } from "@/lib/phaser/models/configuration/SpriteConfiguration";
import { type SpritesheetKey } from "@/models/dungeons/keys/SpritesheetKey";
import { type Position } from "grid-engine";

interface AttackProps {
  position: Position;
  spritesheetKey: SpritesheetKey;
  frame: SpriteConfiguration["frame"];
}

const { position, spritesheetKey, frame } = defineProps<AttackProps>();
</script>

<template>
  <Sprite :configuration="{ ...position, textureKey: spritesheetKey, frame, origin: 0.5, scale: 4 }" />
</template>
