import { statsSchema, type Stats } from "@/models/dungeons/Stats";
import { AItemEntity, aItemEntitySchema } from "@/models/shared/AItemEntity";
import { type z } from "zod";

export class Player extends AItemEntity implements Stats {
  health = 10;
  attack = 3;
  armor = 2;
}

export const playerSchema = aItemEntitySchema.merge(statsSchema) satisfies z.ZodType<Player>;
