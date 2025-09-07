<script setup lang="ts">
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
// @TODO: https://github.com/vuejs/core/issues/11371
export interface CharacterProps {
  id: Character["id"];
  onComplete?: InstanceType<typeof Sprite>["$props"]["onComplete"];
  onMovementStarted?: (scene: SceneWithPlugins, ...args: Parameters<MovementStarted>) => ReturnType<MovementStarted>;
  onMovementStopped?: (scene: SceneWithPlugins, ...args: Parameters<MovementStopped>) => ReturnType<MovementStopped>;
  onPositionChangeFinished?: (
    scene: SceneWithPlugins,
    ...args: Parameters<PositionChangeFinished>
  ) => ReturnType<PositionChangeFinished>;
  onPositionChangeStarted?: (
    scene: SceneWithPlugins,
    ...args: Parameters<PositionChangeStarted>
  ) => ReturnType<PositionChangeStarted>;
  singleSidedSpritesheetDirection?: Character["singleSidedSpritesheetDirection"];
  speed?: number;
  spriteConfiguration: InstanceType<typeof Sprite>["$props"]["configuration"];
  walkingAnimationMapping: Character["walkingAnimationMapping"];
}

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
const position = defineModel<Position>("position", { required: true });
const direction = defineModel<Direction | undefined>("direction", { required: true });
const flipX = computed(
  () =>
    (singleSidedSpritesheetDirection === Direction.LEFT && direction.value === Direction.RIGHT) ||
    (singleSidedSpritesheetDirection === Direction.RIGHT && direction.value === Direction.LEFT),
);
const subscriptionMovementStarted = ref<Subscription>();
const subscriptionMovementStopped = ref<Subscription>();
const subscriptionPositionChangeStarted = ref<Subscription>();
const subscriptionPositionChangeFinished = ref<Subscription>();
const subscriptionDirectionChanged = ref<Subscription>();
// We don't need to remove our character here from grid engine
// since it will automatically be removed when we create a new tilemap
onUnmounted(() => {
  subscriptionMovementStarted.value?.unsubscribe();
  subscriptionMovementStopped.value?.unsubscribe();
  subscriptionPositionChangeStarted.value?.unsubscribe();
  subscriptionPositionChangeFinished.value?.unsubscribe();
  subscriptionDirectionChanged.value?.unsubscribe();
});
</script>

<template>
  <Sprite
    :configuration="{ flipX, ...spriteConfiguration }"
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
          subscriptionMovementStarted = scene.gridEngine
            .movementStarted()
            .pipe(filter(({ charId }) => charId === id))
            .subscribe((movement) => fn(scene, movement));
        }

        if (onMovementStopped) {
          const fn = onMovementStopped;
          subscriptionMovementStopped = scene.gridEngine
            .movementStopped()
            .pipe(filter(({ charId }) => charId === id))
            .subscribe((movement) => fn(scene, movement));
        }

        subscriptionPositionChangeStarted = scene.gridEngine
          .positionChangeStarted()
          .pipe(filter(({ charId }) => charId === id))
          .subscribe((positionChange) => {
            const { charId } = positionChange;
            direction = scene.gridEngine.getFacingDirection(charId);
            onPositionChangeStarted?.(scene, positionChange);
          });
        subscriptionPositionChangeFinished = scene.gridEngine
          .positionChangeFinished()
          .pipe(filter(({ charId }) => charId === id))
          .subscribe((positionChange) => {
            const { charId, enterTile } = positionChange;
            position = enterTile;
            direction = scene.gridEngine.getFacingDirection(charId);
            onPositionChangeFinished?.(scene, positionChange);
          });
        subscriptionDirectionChanged = scene.gridEngine
          .directionChanged()
          .pipe(filter(({ charId }) => charId === id))
          .subscribe(({ direction: newDirection }) => {
            direction = newDirection;
          });
        onComplete?.(scene, sprite);
      }
    "
  />
</template>
