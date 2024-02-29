import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { NpcMovementPattern } from "@/models/dungeons/world/home/NpcMovementPattern";
import { getNextDirection } from "@/services/dungeons/input/getNextDirection";
import { useNpcStore } from "@/store/dungeons/world/npc";
import { exhaustiveGuard } from "@/util/exhaustiveGuard";

export const useMoveNpcList = () => {
  const phaserStore = usePhaserStore();
  const { scene } = storeToRefs(phaserStore);
  const npcStore = useNpcStore();
  const { npcList } = storeToRefs(npcStore);

  for (const npc of npcList.value) {
    if (!scene.value.gridEngine.hasCharacter(npc.id) || npc.isMoving) continue;

    switch (npc.movementPattern) {
      case NpcMovementPattern.Idle:
        continue;
      case NpcMovementPattern.Clockwise: {
        const pathSize = Object.keys(npc.path).length;
        const newPathIndex = (npc.pathIndex + 1) % pathSize;
        const currentPosition = npc.path[npc.pathIndex];
        const nextPosition = npc.path[newPathIndex];
        if (scene.value.gridEngine.isBlocked(nextPosition)) continue;

        scene.value.gridEngine.move(npc.id, getNextDirection(currentPosition, nextPosition));
        npc.pathIndex = newPathIndex;
        continue;
      }
      default:
        exhaustiveGuard(npc.movementPattern);
    }
  }
};
