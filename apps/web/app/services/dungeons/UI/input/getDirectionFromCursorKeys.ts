import type { InteractableDirection } from "@/models/dungeons/direction/InteractableDirection";
import type { BaseCursorKeys } from "@/models/dungeons/input/BaseCursorKeys";

import { getDirectionCursorKeyMap } from "@/services/dungeons/UI/input/getDirectionCursorKeyMap";
import { Direction } from "grid-engine";
import { Input } from "phaser";

export const getDirectionFromCursorKeys = (cursorKeys: BaseCursorKeys, isJustDown?: true) => {
  // Object.entries widens its keys to string, and the record it reads is keyed by the directions in getDirectionCursorKeyMap
  const directionCursorKeyEntries = Object.entries(getDirectionCursorKeyMap(cursorKeys)) as [
    InteractableDirection,
    Input.Keyboard.Key,
  ][];

  for (const [direction, cursorKey] of directionCursorKeyEntries)
    if (isJustDown ? Input.Keyboard.JustDown(cursorKey) : cursorKey.isDown) return direction;

  return Direction.NONE;
};
