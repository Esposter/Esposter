import type { NpcId } from "#shared/generated/tiled/propertyTypes/enum/NpcId";
import type { Effect } from "@/models/dungeons/npc/effect/Effect";
import type { Npc as NpcData } from "@/models/dungeons/npc/Npc";
import type { Position } from "grid-engine";
import type { Except } from "type-fest";

import { MovementPattern } from "@/models/dungeons/npc/MovementPattern";
import { Character } from "@/models/dungeons/scene/world/Character";
// Npc position will be computed based on path[pathIndex]
export class Npc extends Character<NpcId> implements Except<NpcData, "frame" | "id"> {
  effects: Effect[] = [];
  isMoving = false;
  movementPattern = MovementPattern.Idle;
  path: Record<number, Position> = {};
  pathIndex = 0;

  constructor(init: Partial<Npc>) {
    super(init);
    Object.assign(this, init);
  }
}
