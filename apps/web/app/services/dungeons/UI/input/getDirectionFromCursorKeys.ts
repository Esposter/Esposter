import type { BaseCursorKeys } from "#src/models/dungeons/input/BaseCursorKeys";

import { InteractableDirection } from "#src/models/dungeons/direction/InteractableDirection";
import { getDirectionCursorKeyMap } from "#src/services/dungeons/UI/input/getDirectionCursorKeyMap";
import { Direction } from "grid-engine-headless";
import { Input } from "phaser";

export const getDirectionFromCursorKeys = (cursorKeys: BaseCursorKeys, isJustDown?: true) => {
  const directionCursorKeyMap = getDirectionCursorKeyMap(cursorKeys);
  // Walked through the directions' own value set, in the order the map is written, so the first key held wins as before
  for (const direction of Object.values(InteractableDirection)) {
    const cursorKey = directionCursorKeyMap[direction];
    if (isJustDown ? Input.Keyboard.JustDown(cursorKey) : cursorKey.isDown) return direction;
  }

  return Direction.None;
};
