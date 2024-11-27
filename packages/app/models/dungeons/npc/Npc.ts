import type { Effect } from "@/models/dungeons/npc/effect/Effect";
import type { MovementPattern } from "@/models/dungeons/npc/MovementPattern";
import type { NpcId } from "@/shared/generated/tiled/propertyTypes/enum/NpcId";

export interface Npc {
  effects: Effect[];
  frame: number;
  id: NpcId;
  movementPattern: MovementPattern;
}
