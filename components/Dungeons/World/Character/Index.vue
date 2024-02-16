<script setup lang="ts">
import Sprite, { type SpriteProps } from "@/lib/phaser/components/Sprite.vue";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { BEFORE_DESTROY_SCENE_EVENT_KEY } from "@/lib/phaser/util/constants";
import { type Character } from "@/models/dungeons/world/Character";
import { type Direction, type Position, type WalkingAnimationMapping } from "grid-engine";
import { type GameObjects } from "phaser";

interface CharacterProps {
  id: Character["id"];
  spriteConfiguration: SpriteProps["configuration"];
  walkingAnimationMapping: WalkingAnimationMapping;
  startPosition: Position;
  facingDirection?: Direction;
  onComplete?: (sprite: GameObjects.Sprite) => void;
}

const { id, spriteConfiguration, walkingAnimationMapping, startPosition, facingDirection, onComplete } =
  defineProps<CharacterProps>();
const phaserStore = usePhaserStore();
const { scene, sceneKey } = storeToRefs(phaserStore);

usePhaserListener(`${BEFORE_DESTROY_SCENE_EVENT_KEY}${sceneKey.value}`, () =>
  scene.value.gridEngine.removeCharacter(id),
);
</script>

<template>
  <Sprite
    :configuration="{ origin: 0, ...spriteConfiguration }"
    :on-complete="
      (sprite) => {
        scene.gridEngine.addCharacter({ id, sprite, walkingAnimationMapping, startPosition, facingDirection });
        onComplete?.(sprite);
      }
    "
  />
</template>
