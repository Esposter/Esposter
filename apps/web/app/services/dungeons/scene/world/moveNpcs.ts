import type { GridEngine } from "grid-engine-headless";

import { MovementPattern } from "#src/models/dungeons/npc/MovementPattern";
import { getNextDirection } from "#src/services/dungeons/UI/input/getNextDirection";
import { useNpcStore } from "#src/store/dungeons/world/npc";
import { exhaustiveGuard, noop, takeOne } from "@esposter/shared";

export const moveNpcs = (gridEngine: GridEngine) => {
  const npcStore = useNpcStore();
  const { items } = storeToRefs(npcStore);

  for (const npc of items.value) {
    if (!gridEngine.checkHasCharacter(npc.id) || npc.isMoving) continue;

    switch (npc.movementPattern) {
      case MovementPattern.Idle:
        continue;
      case MovementPattern.Clockwise: {
        const pathSize = Object.keys(npc.path).length;
        const newPathIndex = (npc.pathIndex + 1) % pathSize;
        const currentPosition = takeOne(npc.path, npc.pathIndex);
        const nextPosition = takeOne(npc.path, newPathIndex);
        if (gridEngine.checkIsBlocked(nextPosition)) continue;

        gridEngine.move(npc.id, getNextDirection(currentPosition, nextPosition)).match(noop, console.error);
        npc.pathIndex = newPathIndex;
        continue;
      }
      default:
        exhaustiveGuard(npc.movementPattern);
    }
  }
};
