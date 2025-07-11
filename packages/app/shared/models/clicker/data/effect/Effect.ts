import type { EffectConfiguration } from "#shared/models/clicker/data/effect/EffectConfiguration";
import type { Target } from "#shared/models/clicker/data/Target";

import { effectConfigurationSchema } from "#shared/models/clicker/data/effect/EffectConfiguration";
import { targetSchema } from "#shared/models/clicker/data/Target";
import { z } from "zod";

export interface Effect {
  configuration: EffectConfiguration;
  targets: Target[];
  value: number;
}

export const effectSchema = z.object({
  configuration: effectConfigurationSchema,
  targets: targetSchema.array().min(1),
  value: z.number(),
}) satisfies z.ZodType<Effect>;
