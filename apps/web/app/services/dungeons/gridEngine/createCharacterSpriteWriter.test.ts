import type { WalkingAnimationMapping } from "#src/models/dungeons/scene/world/WalkingAnimationMapping";
import type { GameObjects, Tilemaps } from "phaser";
import type { Mock } from "vitest";

import { createCharacterSpriteWriter } from "#src/services/dungeons/gridEngine/createCharacterSpriteWriter";
import { getCharacterDepth } from "#src/services/dungeons/gridEngine/getCharacterDepth";
import { createGridEngine, Direction } from "grid-engine-headless";
import { ok } from "neverthrow";
import { assert, beforeEach, describe, expect, test, vi } from "vitest";

describe(createCharacterSpriteWriter, () => {
  const CHARACTER_ID = "Player";
  const TILE_SIZE = 16;
  const SPRITE_SIZE = 8;
  const LAYER_COUNT = 2;
  // A sprite's top-left corner, where the tile's corner centres and bottom aligns it
  const PLACED_LEFT = 20;
  const PLACED_TOP = 8;
  const DOWN_FRAMES = { leftFoot: 6, rightFoot: 8, standing: 7 };
  const WALKING_ANIMATION_MAPPING: WalkingAnimationMapping = { [Direction.Down]: DOWN_FRAMES };

  // A one-row grid with the character on its second tile, facing down
  const createAttachedGridEngine = () => {
    const gridEngine = createGridEngine({ tiles: [[false, false]] }).unwrapOr(undefined);
    assert.exists(gridEngine);
    expect(
      gridEngine.addCharacter({ facingDirection: Direction.Down, id: CHARACTER_ID, startPosition: { x: 1, y: 0 } }),
    ).toStrictEqual(ok());
    return gridEngine;
  };

  let setDepth: Mock<(depth: number) => void>;
  let setFrame: Mock<(frame: number) => void>;
  let setOrigin: Mock<(x: number, y: number) => void>;
  let setPosition: Mock<(x: number, y: number) => void>;
  let sprite: GameObjects.Sprite;
  let tilemap: Tilemaps.Tilemap;

  beforeEach(() => {
    setDepth = vi.fn<(depth: number) => void>();
    setFrame = vi.fn<(frame: number) => void>();
    setOrigin = vi.fn<(x: number, y: number) => void>();
    setPosition = vi.fn<(x: number, y: number) => void>();
    sprite = {
      displayHeight: SPRITE_SIZE,
      displayWidth: SPRITE_SIZE,
      setDepth,
      setFrame,
      setOrigin,
      setPosition,
    } as unknown as GameObjects.Sprite;
    tilemap = {
      layers: Array.from({ length: LAYER_COUNT }, () => ({})),
      tileHeight: TILE_SIZE,
      tileWidth: TILE_SIZE,
    } as unknown as Tilemaps.Tilemap;
  });

  test("a sprite is drawn from its top-left corner, so its origin is set to that corner when it is attached", () => {
    expect.hasAssertions();

    createCharacterSpriteWriter(createAttachedGridEngine(), tilemap, CHARACTER_ID, sprite, WALKING_ANIMATION_MAPPING);

    expect(setOrigin).toHaveBeenCalledExactlyOnceWith(0, 0);
  });

  test("a character is placed, depth-sorted and framed when it is attached, before any update", () => {
    expect.hasAssertions();

    createCharacterSpriteWriter(createAttachedGridEngine(), tilemap, CHARACTER_ID, sprite, WALKING_ANIMATION_MAPPING);

    expect(setPosition).toHaveBeenCalledExactlyOnceWith(PLACED_LEFT, PLACED_TOP);
    expect(setDepth).toHaveBeenCalledExactlyOnceWith(getCharacterDepth(LAYER_COUNT, PLACED_TOP + SPRITE_SIZE));
    expect(setFrame).toHaveBeenCalledExactlyOnceWith(DOWN_FRAMES.standing);
  });
});
