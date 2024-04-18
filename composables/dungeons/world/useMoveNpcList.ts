import { NpcMovementPattern } from "@/generated/tiled/propertyTypes/enum/NpcMovementPattern";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { getNextDirection } from "@/services/dungeons/input/getNextDirection";
import { useNpcStore } from "@/store/dungeons/world/npc";
import { exhaustiveGuard } from "@/util/exhaustiveGuard";

export const useMoveNpcList = (scene: SceneWithPlugins) => {
  const npcStore = useNpcStore();
  const { npcList } = storeToRefs(npcStore);

  for (const npc of npcList.value) {
    if (!scene.gridEngine.hasCharacter(npc.id) || npc.isMoving) continue;

    switch (npc.movementPattern) {
      case NpcMovementPattern.Idle:
        continue;
      case NpcMovementPattern.Clockwise: {
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
