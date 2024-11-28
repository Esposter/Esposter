import type { NpcId } from "#shared/generated/tiled/propertyTypes/enum/NpcId";
import type { Npc as NpcData } from "@/models/dungeons/npc/Npc";
import type { Character } from "@/models/dungeons/scene/world/Character";
import type { Position } from "grid-engine";
import type { Except } from "type-fest";
// Npc position will be computed based on path[pathIndex]
export interface Npc extends Except<Character<NpcId>, "position">, Except<NpcData, "frame" | "id"> {
  isMoving: boolean;
  path: Record<number, Position>;
  pathIndex: number;
}
