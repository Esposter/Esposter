import type { SceneWithPlugins } from "vue-phaserjs";

import { MovementPattern } from "@/models/dungeons/npc/MovementPattern";
import { getNextDirection } from "@/services/dungeons/UI/input/getNextDirection";
import { useNpcStore } from "@/store/dungeons/world/npc";
import { exhaustiveGuard } from "@esposter/shared";

export const useMoveNpcs = (scene: SceneWithPlugins) => {
  const npcStore = useNpcStore();
  const { items } = storeToRefs(npcStore);

  for (const npc of items.value) {
    if (!scene.gridEngine.hasCharacter(npc.id) || npc.isMoving) continue;

    switch (npc.movementPattern) {
      case MovementPattern.Idle:
        continue;
      case MovementPattern.Clockwise: {
        const pathSize = Object.keys(npc.path).length;
        const newPathIndex = (npc.pathIndex + 1) % pathSize;
        const currentPosition = npc.path[npc.pathIndex];
        const nextPosition = npc.path[newPathIndex];
        if (scene.gridEngine.isBlocked(nextPosition)) continue;

        scene.gridEngine.move(npc.id, getNextDirection(currentPosition, nextPosition));
        npc.pathIndex = newPathIndex;
        continue;
      }
      default:
        exhaustiveGuard(npc.movementPattern);
    }
  }
};
