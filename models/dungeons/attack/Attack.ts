import type { Animation } from "@/models/dungeons/animation/Animation";
import { animationSchema } from "@/models/dungeons/animation/Animation";
import type { AttackId } from "@/models/dungeons/attack/AttackId";
import { attackIdSchema } from "@/models/dungeons/attack/AttackId";
import type { AttackName } from "@/models/dungeons/attack/AttackName";
import { attackNameSchema } from "@/models/dungeons/attack/AttackName";
import type { Except } from "@/util/types/Except";
import { z } from "zod";

export interface Attack {
  id: AttackId;
  name: AttackName;
  animation: Animation;
}

export const attackSchema = z.object({
  id: attackIdSchema,
  name: attackNameSchema,
  animation: animationSchema,
}) satisfies z.ZodType<Except<Attack, "name">>;
