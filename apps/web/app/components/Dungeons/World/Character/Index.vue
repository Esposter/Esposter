<script setup lang="ts">
import type { CharacterProps } from "#src/components/Dungeons/World/Character/CharacterProps";
import type { Position } from "grid-engine";
import type { Observable, Subscription } from "rxjs";

import { omitUndefined } from "@esposter/shared";
import { Direction } from "grid-engine";
import { filter } from "rxjs";
import { Sprite } from "vue-phaserjs";

const position = defineModel<Position>("position", { required: true });
const direction = defineModel<Direction | undefined>("direction", { required: true });
const isMoving = defineModel<boolean>("isMoving", { required: true });
defineProps<CharacterProps>();
// Every grid-engine stream this character listens on, so a stream costs one call rather than a ref and a line in the
// Teardown. Grid engine removes the character itself when a new tilemap is created
const subscriptions = ref<Subscription[]>([]);

const unsubscribeAll = () => {
  for (const subscription of subscriptions.value) subscription.unsubscribe();
  subscriptions.value.length = 0;
};
// Filters a stream to this character and holds its subscription for the teardown, the two steps every stream takes
const subscribeToCharacter = <TEvent extends { charId: string }>(
  id: string,
  events: Observable<TEvent>,
  onEvent: (event: TEvent) => void,
) => {
  subscriptions.value.push(events.pipe(filter(({ charId }) => charId === id)).subscribe(onEvent));
};

onUnmounted(unsubscribeAll);
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
        // The sprite can be created again, and each creation adds its subscriptions, so the last set is released first
        unsubscribeAll();
        // The world camera's zoom scales every sprite, which the default rounding skips, so a pixel sprite walking
        // Between tiles would land between screen pixels and smear across both
        sprite.setVertexRoundMode('fullAuto');
        scene.gridEngine.addCharacter({
          id,
          sprite,
          walkingAnimationMapping,
          startPosition: position,
          ...omitUndefined({ facingDirection: direction, speed }),
        });
        subscribeToCharacter(id, scene.gridEngine.movementStarted(), () => {
          isMoving = true;
        });
        subscribeToCharacter(id, scene.gridEngine.movementStopped(), () => {
          isMoving = false;
        });

        subscribeToCharacter(id, scene.gridEngine.positionChangeStarted(), (positionChange) => {
          const { charId } = positionChange;
          direction = scene.gridEngine.getFacingDirection(charId);
          onPositionChangeStarted?.(scene, positionChange);
        });
        subscribeToCharacter(id, scene.gridEngine.positionChangeFinished(), (positionChange) => {
          const { charId, enterTile } = positionChange;
          position = enterTile;
          direction = scene.gridEngine.getFacingDirection(charId);
          onPositionChangeFinished?.(scene, positionChange);
        });
        subscribeToCharacter(id, scene.gridEngine.directionChanged(), ({ direction: newDirection }) => {
          direction = newDirection;
        });
        onComplete?.(scene, sprite);
      }
    "
  />
</template>
