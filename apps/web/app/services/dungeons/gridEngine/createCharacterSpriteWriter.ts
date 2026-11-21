import type { WalkingAnimationMapping } from "#src/models/dungeons/scene/world/WalkingAnimationMapping";
import type { WalkingFrameState } from "#src/models/dungeons/scene/world/WalkingFrameState";
import type { CharacterState, GridEngine } from "grid-engine-headless";
import type { GameObjects, Tilemaps } from "phaser";

import { getCharacterDepth } from "#src/services/dungeons/gridEngine/getCharacterDepth";
import { getSpritePixelPosition } from "#src/services/dungeons/gridEngine/getSpritePixelPosition";
import { getStepFrame } from "#src/services/dungeons/gridEngine/getStepFrame";
import { getTurnFrame } from "#src/services/dungeons/gridEngine/getTurnFrame";

// Draws a character's sprite from the engine's state: its pixel, its depth and its walking frame. The walking frame is
// Held in the closure with the sprite, so the engine and the store hold no Phaser object
export const createCharacterSpriteWriter = (
  gridEngine: GridEngine,
  tilemap: Tilemaps.Tilemap,
  id: string,
  sprite: GameObjects.Sprite,
  walkingAnimationMapping: WalkingAnimationMapping,
) => {
  // No frame has been shown yet, so the first step starts from the foot the last step did not plant
  let walkingFrameState: WalkingFrameState = { frame: -1, isLastFootLeft: false };
  const writeCharacterSprite = ({ facingDirection, position, progress }: CharacterState) => {
    const frames = walkingAnimationMapping[facingDirection];
    if (!frames) return;

    walkingFrameState =
      progress === 0 ? getTurnFrame(frames, walkingFrameState) : getStepFrame(frames, walkingFrameState, progress);
    const pixel = getSpritePixelPosition({
      customOffset: { x: 0, y: 0 },
      displayHeight: sprite.displayHeight,
      displayWidth: sprite.displayWidth,
      facing: facingDirection,
      position,
      progress,
      tileHeight: tilemap.tileHeight,
      tileWidth: tilemap.tileWidth,
    });
    sprite.setPosition(pixel.x, pixel.y);
    sprite.setDepth(getCharacterDepth(tilemap.layers.length, pixel.y + sprite.displayHeight));
    sprite.setFrame(walkingFrameState.frame);
  };

  return () => {
    gridEngine.readCharacter(id).match(writeCharacterSprite, console.error);
  };
};
