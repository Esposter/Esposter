import type { AttackId } from "@/models/dungeons/attack/AttackId";
import { attackIdSchema } from "@/models/dungeons/attack/AttackId";
import type { AttackName } from "@/models/dungeons/attack/AttackName";
import { attackNameSchema } from "@/models/dungeons/attack/AttackName";
import type { Except } from "@/util/types/Except";
import { z } from "zod";

export interface Attack {
  id: AttackId;
  name: AttackName;
}

export const attackSchema = z.object({
  id: attackIdSchema,
  name: attackNameSchema,
}) satisfies z.ZodType<Except<Attack, "name"> & { name: string }>;
