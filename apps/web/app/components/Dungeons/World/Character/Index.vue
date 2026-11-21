<script setup lang="ts">
import type { CharacterProps } from "#src/components/Dungeons/World/Character/CharacterProps";
import type { GridEngine, GridEngineEvents, Position } from "grid-engine-headless";
import type { GameObjects } from "phaser";
import type { SceneWithPlugins } from "vue-phaserjs";

import { createCharacterSpriteWriter } from "#src/services/dungeons/gridEngine/createCharacterSpriteWriter";
import { useWorldSceneStore } from "#src/store/dungeons/world/scene";
import { noop, omitUndefined } from "@esposter/shared";
import { Direction } from "grid-engine-headless";
import { Sprite } from "vue-phaserjs";

const position = defineModel<Position>("position", { required: true });
const direction = defineModel<Direction | undefined>("direction", { required: true });
const isMoving = defineModel<boolean>("isMoving", { required: true });
const props = defineProps<CharacterProps>();
const worldSceneStore = useWorldSceneStore();
const { characterIdSpriteWriterMap } = worldSceneStore;
const { gridEngine, tilemap } = storeToRefs(worldSceneStore);
// Every subscription this character holds on the engine, released when the sprite is created again and on teardown
const unsubscribes: (() => void)[] = [];

const releaseCharacter = () => {
  for (const unsubscribe of unsubscribes) unsubscribe();
  unsubscribes.length = 0;
  characterIdSpriteWriterMap.delete(props.id);
};
// The engine emits for every character, so each listener checks the payload's id before it reads the event
const subscribeToCharacter = <TEvent extends keyof GridEngineEvents>(
  engine: GridEngine,
  event: TEvent,
  onEvent: (payload: GridEngineEvents[TEvent]) => void,
) => {
  unsubscribes.push(
    engine.on(event, (payload) => {
      if (payload.id === props.id) onEvent(payload);
    }),
  );
};

const attachSprite = (scene: SceneWithPlugins, sprite: GameObjects.Sprite) => {
  // The sprite can be created again, and each creation adds its subscriptions, so the last set is released first
  releaseCharacter();
  // The world camera's zoom scales every sprite, which the default rounding skips, so a pixel sprite walking
  // Between tiles would land between screen pixels and smear across both
  sprite.setVertexRoundMode("fullAuto");
  const engine = gridEngine.value;
  if (engine && tilemap.value) {
    engine
      .addCharacter({
        id: props.id,
        startPosition: position.value,
        ...omitUndefined({ facingDirection: direction.value, speed: props.speed }),
      })
      .match(noop, console.error);
    characterIdSpriteWriterMap.set(
      props.id,
      createCharacterSpriteWriter(engine, tilemap.value, props.id, sprite, props.walkingAnimationMapping),
    );
    subscribeToCharacter(engine, "movementStarted", () => {
      isMoving.value = true;
    });
    subscribeToCharacter(engine, "movementStopped", () => {
      isMoving.value = false;
    });
    subscribeToCharacter(engine, "positionChangeStarted", (positionChange) => {
      direction.value = positionChange.direction;
      props.onPositionChangeStarted?.(scene, positionChange);
    });
    subscribeToCharacter(engine, "positionChangeFinished", (positionChange) => {
      position.value = positionChange.enterTile;
      direction.value = positionChange.direction;
      props.onPositionChangeFinished?.(scene, positionChange);
    });
    subscribeToCharacter(engine, "directionChanged", ({ direction: newDirection }) => {
      direction.value = newDirection;
    });
  }
  props.onComplete?.(scene, sprite);
};

onUnmounted(releaseCharacter);
</script>

<template>
  <Sprite
    :configuration="{
      flipX:
        (singleSidedSpritesheetDirection === Direction.Left && direction === Direction.Right) ||
        (singleSidedSpritesheetDirection === Direction.Right && direction === Direction.Left),
      ...spriteConfiguration,
    }"
    :on-complete="attachSprite"
  />
</template>
