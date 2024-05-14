import type { NpcId } from "@/generated/tiled/propertyTypes/enum/NpcId";
import type { Npc as NpcData } from "@/models/dungeons/npc/Npc";
import type { Character } from "@/models/dungeons/scene/world/Character";
import type { Position } from "grid-engine";
import type { Except } from "type-fest";
// Npc position will be computed based on path[pathIndex]
export interface Npc extends Except<Character<NpcId>, "position">, Except<NpcData, "id" | "frame"> {
  path: Record<number, Position>;
  pathIndex: number;
  isMoving: boolean;
}
