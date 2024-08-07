import type { EffectConfiguration } from "@/models/clicker/data/effect/EffectConfiguration";
import type { Target } from "@/models/clicker/data/Target";

import { effectConfigurationSchema } from "@/models/clicker/data/effect/EffectConfiguration";
import { targetSchema } from "@/models/clicker/data/Target";
import { z } from "zod";

export interface Effect {
  configuration: EffectConfiguration;
  targets: Target[];
  value: number;
}

export const effectSchema = z.object({
  configuration: effectConfigurationSchema,
  targets: z.array(targetSchema).min(1),
  value: z.number(),
}) satisfies z.ZodType<Effect>;
