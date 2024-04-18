import type { NpcMovementPattern } from "@/generated/tiled/propertyTypes/enum/NpcMovementPattern";
import type { Character } from "@/models/dungeons/world/Character";
import type { Except } from "@/util/types/Except";
import type { Position } from "grid-engine";
// Npc position will be computed based on path[pathIndex]
export interface Npc extends Except<Character, "position"> {
  messages: string[];
  path: Record<number, Position>;
  pathIndex: number;
  movementPattern: NpcMovementPattern;
  isMoving: boolean;
}
