<script setup lang="ts">
import type { CharacterProps } from "@/components/Dungeons/World/Character/CharacterProps";
import type { MovementStarted } from "@/models/dungeons/gridEngine/MovementStarted";
import type { MovementStopped } from "@/models/dungeons/gridEngine/MovementStopped";
import type { PositionChangeFinished } from "@/models/dungeons/gridEngine/PositionChangeFinished";
import type { PositionChangeStarted } from "@/models/dungeons/gridEngine/PositionChangeStarted";
import type { Character } from "@/models/dungeons/scene/world/Character";
import type { Position } from "grid-engine";
import type { Subscription } from "rxjs";
import type { SceneWithPlugins } from "vue-phaserjs";

import { Direction } from "grid-engine";
import { filter } from "rxjs";
import { Sprite } from "vue-phaserjs";

const position = defineModel<Position>("position", { required: true });
const direction = defineModel<Direction | undefined>("direction", { required: true });
const {
  id,
  onComplete,
  onMovementStarted,
  onMovementStopped,
  onPositionChangeFinished,
  onPositionChangeStarted,
  singleSidedSpritesheetDirection,
  speed,
  spriteConfiguration,
  walkingAnimationMapping,
} = defineProps<CharacterProps>();
// Every grid-engine stream this character listens on, so a sixth costs a push rather than a ref and a line in
// The teardown. Grid engine removes the character itself when a new tilemap is created
const subscriptions = ref<Subscription[]>([]);

onUnmounted(() => {
  for (const subscription of subscriptions.value) subscription.unsubscribe();
});
</script>

<template>
  <Sprite
    :configuration="{
      flipX:
        (singleSidedSpritesheetDirection === Direction.LEFT && direction === Direction.RIGHT) ||
        (singleSidedSpritesheetDirection === Direction.RIGHT && direction === Direction.LEFT),
      ...spriteConfiguration,
    }"
    :on-complete="
      (scene, sprite) => {
        scene.gridEngine.addCharacter({
          id,
          sprite,
          walkingAnimationMapping,
          startPosition: position,
          facingDirection: direction,
          speed,
        });
        if (onMovementStarted) {
          const fn = onMovementStarted;
          subscriptions.push(
            scene.gridEngine
              .movementStarted()
              .pipe(filter(({ charId }) => charId === id))
              .subscribe((movement) => fn(scene, movement)),
          );
        }

        if (onMovementStopped) {
          const fn = onMovementStopped;
          subscriptions.push(
            scene.gridEngine
              .movementStopped()
              .pipe(filter(({ charId }) => charId === id))
              .subscribe((movement) => fn(scene, movement)),
          );
        }

        subscriptions.push(
          scene.gridEngine
            .positionChangeStarted()
            .pipe(filter(({ charId }) => charId === id))
            .subscribe((positionChange) => {
              const { charId } = positionChange;
              direction = scene.gridEngine.getFacingDirection(charId);
              onPositionChangeStarted?.(scene, positionChange);
            }),
        );
        subscriptions.push(
          scene.gridEngine
            .positionChangeFinished()
            .pipe(filter(({ charId }) => charId === id))
            .subscribe((positionChange) => {
              const { charId, enterTile } = positionChange;
              position = enterTile;
              direction = scene.gridEngine.getFacingDirection(charId);
              onPositionChangeFinished?.(scene, positionChange);
            }),
        );
        subscriptions.push(
          scene.gridEngine
            .directionChanged()
            .pipe(filter(({ charId }) => charId === id))
            .subscribe(({ direction: newDirection }) => {
              direction = newDirection;
            }),
        );
        onComplete?.(scene, sprite);
      }
    "
  />
</template>
