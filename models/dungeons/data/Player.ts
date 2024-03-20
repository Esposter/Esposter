import { directionSchema } from "@/models/dungeons/data/Direction";
import { positionSchema } from "@/models/dungeons/data/Position";
import type { Position } from "grid-engine";
import { Direction } from "grid-engine";
import { z } from "zod";

export class Player {
  position: Position = { x: 6, y: 21 };
  direction = Direction.DOWN;
}
export const playerSchema = z.object({
  position: positionSchema,
  direction: directionSchema,
}) satisfies z.ZodType<Player>;
