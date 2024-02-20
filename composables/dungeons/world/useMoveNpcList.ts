import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { NpcMovementPattern } from "@/models/dungeons/world/home/NpcMovementPattern";
import { getNextDirection } from "@/services/dungeons/input/getNextDirection";
import { useNpcStore } from "@/store/dungeons/world/npc";
import { exhaustiveGuard } from "@/util/exhaustiveGuard";
import { type Position } from "grid-engine";

export const useMoveNpcList = () => {
  const phaserStore = usePhaserStore();
  const { scene } = storeToRefs(phaserStore);
  const npcStore = useNpcStore();
  const { npcList } = storeToRefs(npcStore);

  for (const npc of npcList.value) {
    if (npc.isMoving) continue;

    let pathSize: number;
    let currentPosition: Position;
    let nextPosition: Position;

    switch (npc.movementPattern) {
      case NpcMovementPattern.Idle:
        continue;
      case NpcMovementPattern.Clockwise:
        pathSize = Object.keys(npc.path).length;
        currentPosition = npc.path[npc.pathIndex];
        npc.pathIndex = (npc.pathIndex + 1) % pathSize;
        nextPosition = npc.path[npc.pathIndex];
        scene.value.gridEngine.move(npc.id, getNextDirection(currentPosition, nextPosition));
        continue;
      default:
        exhaustiveGuard(npc.movementPattern);
    }
  }
};
