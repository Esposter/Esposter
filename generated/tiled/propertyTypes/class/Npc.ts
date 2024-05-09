import type { NpcMovementPattern } from "@/generated/tiled/propertyTypes/enum/NpcMovementPattern";

export interface Npc {
  frame: string;
  messages: string;
  movementPattern: NpcMovementPattern;
}
