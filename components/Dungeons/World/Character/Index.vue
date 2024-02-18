<script setup lang="ts">
import Sprite, { type SpriteProps } from "@/lib/phaser/components/Sprite.vue";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { BEFORE_DESTROY_SCENE_EVENT_KEY } from "@/lib/phaser/util/constants";
import { type Character } from "@/models/dungeons/world/Character";
import type GridEngine from "grid-engine";
// eslint-disable-next-line no-duplicate-imports
import { type Direction, type Position, type WalkingAnimationMapping } from "grid-engine";
import { type GameObjects } from "phaser";
import { filter, type Subscription } from "rxjs";

interface CharacterProps {
  id: Character["id"];
  spriteConfiguration: SpriteProps["configuration"];
  walkingAnimationMapping: WalkingAnimationMapping;
  onPositionChangeStarted?: Parameters<ReturnType<GridEngine["positionChangeStarted"]>["subscribe"]>[0];
  onPositionChangeFinished?: Parameters<ReturnType<GridEngine["positionChangeFinished"]>["subscribe"]>[0];
  onComplete?: (sprite: GameObjects.Sprite) => void;
}

const {
  id,
  spriteConfiguration,
  walkingAnimationMapping,
  onPositionChangeStarted,
  onPositionChangeFinished,
  onComplete,
} = defineProps<CharacterProps>();
const position = defineModel<Position>("position", { required: true });
const direction = defineModel<Direction>("direction", { required: true });
const phaserStore = usePhaserStore();
const { scene, sceneKey } = storeToRefs(phaserStore);
const subscriptionPositionChangeStarted = ref<Subscription>();
const subscriptionPositionChangeFinished = ref<Subscription>();
const subscriptionDirectionChanged = ref<Subscription>();

usePhaserListener(`${BEFORE_DESTROY_SCENE_EVENT_KEY}${sceneKey.value}`, () => {
  subscriptionPositionChangeStarted.value?.unsubscribe();
  subscriptionPositionChangeFinished.value?.unsubscribe();
  subscriptionDirectionChanged.value?.unsubscribe();
  scene.value.gridEngine.removeCharacter(id);
});
</script>

<template>
  <Sprite
    :configuration="{ origin: 0, ...spriteConfiguration }"
    :on-complete="
      (sprite) => {
        scene.gridEngine.addCharacter({
          id,
          sprite,
          walkingAnimationMapping,
          startPosition: position,
          facingDirection: direction,
        });
        if (onPositionChangeStarted)
          subscriptionPositionChangeStarted = scene.gridEngine
            .positionChangeStarted()
            .pipe(filter(({ charId }) => charId === id))
            .subscribe(onPositionChangeStarted);
        subscriptionPositionChangeFinished = scene.gridEngine
          .positionChangeFinished()
          .pipe(filter(({ charId }) => charId === id))
          .subscribe((positionChange) => {
            const { charId, enterTile } = positionChange;
            position = enterTile;
            direction = scene.gridEngine.getFacingDirection(charId);
            onPositionChangeFinished?.(positionChange);
          });
        subscriptionDirectionChanged = scene.gridEngine
          .directionChanged()
          .pipe(filter(({ charId }) => charId === id))
          .subscribe(({ direction: newDirection }) => {
            direction = newDirection;
          });
        onComplete?.(sprite);
      }
    "
  />
</template>
