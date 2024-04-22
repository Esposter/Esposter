<script setup lang="ts">
import type { SpriteProps } from "@/lib/phaser/components/Sprite.vue";
import Sprite from "@/lib/phaser/components/Sprite.vue";
import { onShutdown } from "@/lib/phaser/hooks/onShutdown";
import type { Character } from "@/models/dungeons/scene/world/Character";
import type { GridEngine, Position } from "grid-engine";
import { Direction } from "grid-engine";
import type { Subscription } from "rxjs";
import { filter } from "rxjs";

export interface CharacterProps {
  characterId: Character["id"];
  spriteConfiguration: SpriteProps["configuration"];
  walkingAnimationMapping: Character["walkingAnimationMapping"];
  singleSidedSpritesheetDirection?: Character["singleSidedSpritesheetDirection"];
  speed?: number;
  onMovementStarted?: Parameters<ReturnType<GridEngine["movementStarted"]>["subscribe"]>[0];
  onMovementStopped?: Parameters<ReturnType<GridEngine["movementStopped"]>["subscribe"]>[0];
  onPositionChangeStarted?: Parameters<ReturnType<GridEngine["positionChangeStarted"]>["subscribe"]>[0];
  onPositionChangeFinished?: Parameters<ReturnType<GridEngine["positionChangeFinished"]>["subscribe"]>[0];
  onComplete?: SpriteProps["onComplete"];
}

const {
  characterId,
  spriteConfiguration,
  walkingAnimationMapping,
  singleSidedSpritesheetDirection,
  speed,
  onMovementStarted,
  onMovementStopped,
  onPositionChangeStarted,
  onPositionChangeFinished,
  onComplete,
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

onShutdown((scene) => {
  subscriptionMovementStarted.value?.unsubscribe();
  subscriptionMovementStopped.value?.unsubscribe();
  subscriptionPositionChangeStarted.value?.unsubscribe();
  subscriptionPositionChangeFinished.value?.unsubscribe();
  subscriptionDirectionChanged.value?.unsubscribe();
  scene.gridEngine.removeCharacter(characterId);
});
</script>

<template>
  <Sprite
    :configuration="{ flipX, ...spriteConfiguration }"
    :on-complete="
      (scene, sprite) => {
        scene.gridEngine.addCharacter({
          id: characterId,
          sprite,
          walkingAnimationMapping,
          startPosition: position,
          facingDirection: direction,
          speed,
        });
        if (onMovementStarted)
          subscriptionMovementStarted = scene.gridEngine
            .movementStarted()
            .pipe(filter(({ charId }) => charId === characterId))
            .subscribe(onMovementStarted);
        if (onMovementStopped)
          subscriptionMovementStopped = scene.gridEngine
            .movementStopped()
            .pipe(filter(({ charId }) => charId === characterId))
            .subscribe(onMovementStopped);
        subscriptionPositionChangeStarted = scene.gridEngine
          .positionChangeStarted()
          .pipe(filter(({ charId }) => charId === characterId))
          .subscribe((positionChange) => {
            const { charId } = positionChange;
            direction = scene.gridEngine.getFacingDirection(charId);
            onPositionChangeStarted?.(positionChange);
          });
        subscriptionPositionChangeFinished = scene.gridEngine
          .positionChangeFinished()
          .pipe(filter(({ charId }) => charId === characterId))
          .subscribe((positionChange) => {
            const { charId, enterTile } = positionChange;
            position = enterTile;
            direction = scene.gridEngine.getFacingDirection(charId);
            onPositionChangeFinished?.(positionChange);
          });
        subscriptionDirectionChanged = scene.gridEngine
          .directionChanged()
          .pipe(filter(({ charId }) => charId === characterId))
          .subscribe(({ direction: newDirection }) => {
            direction = newDirection;
          });
        onComplete?.(scene, sprite);
      }
    "
  />
</template>
