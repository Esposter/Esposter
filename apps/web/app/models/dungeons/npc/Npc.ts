import type { NpcId } from "#shared/generated/tiled/propertyTypes/enum/NpcId";
import type { Effect } from "#src/models/dungeons/npc/effect/Effect";
import type { MovementPattern } from "#src/models/dungeons/npc/MovementPattern";

export interface Npc {
  effects: Effect[];
  frame: number;
  id: NpcId;
  movementPattern: MovementPattern;
}
