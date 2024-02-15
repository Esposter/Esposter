<script setup lang="ts">
import Sprite from "@/lib/phaser/components/Sprite.vue";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { BEFORE_DESTROY_SCENE_EVENT_KEY } from "@/lib/phaser/util/constants";
import { type Asset } from "@/models/dungeons/Asset";
import { type CharacterId } from "@/models/dungeons/world/CharacterId";
import { type Direction, type Position } from "grid-engine";
import { type GameObjects } from "phaser";

interface CharacterProps {
  id: CharacterId;
  asset: Asset;
  startPosition: Position;
  facingDirection?: Direction;
  onComplete?: (sprite: GameObjects.Sprite) => void;
}

const { id, asset, startPosition, facingDirection, onComplete } = defineProps<CharacterProps>();
const phaserStore = usePhaserStore();
const { scene, sceneKey } = storeToRefs(phaserStore);

usePhaserListener(`${BEFORE_DESTROY_SCENE_EVENT_KEY}${sceneKey.value}`, () =>
  scene.value.gridEngine.removeCharacter(id),
);
</script>

<template>
  <Sprite
    :configuration="{ textureKey: asset.key, frame: asset.frame, origin: 0 }"
    :on-complete="
      (sprite) => {
        scene.gridEngine.addCharacter({
          id,
          sprite,
          walkingAnimationMapping: {
            up: {
              leftFoot: 0,
              standing: 1,
              rightFoot: 2,
            },
            down: {
              leftFoot: 6,
              standing: 7,
              rightFoot: 8,
            },
            left: {
              leftFoot: 9,
              standing: 10,
              rightFoot: 11,
            },
            right: {
              leftFoot: 3,
              standing: 4,
              rightFoot: 5,
            },
          },
          startPosition,
          facingDirection,
        });
        onComplete?.(sprite);
      }
    "
  />
</template>
