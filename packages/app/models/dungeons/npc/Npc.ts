import type { NpcId } from "@/generated/tiled/propertyTypes/enum/NpcId";
import type { MovementPattern } from "@/models/dungeons/npc/MovementPattern";
import type { Effect } from "@/models/dungeons/npc/effect/Effect";

export interface Npc {
  id: NpcId;
  frame: number;
  movementPattern: MovementPattern;
  effects: Effect[];
}
