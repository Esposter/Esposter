import type { Target } from "@/models/clicker/data/Target";
import { targetSchema } from "@/models/clicker/data/Target";
import type { EffectConfiguration } from "@/models/clicker/data/effect/EffectConfiguration";
import { effectConfigurationSchema } from "@/models/clicker/data/effect/EffectConfiguration";
import { z } from "zod";

export interface Effect {
  value: number;
  targets: Target[];
  configuration: EffectConfiguration;
}

export const effectSchema = z.object({
  value: z.number(),
  targets: z.array(targetSchema).min(1),
  configuration: effectConfigurationSchema,
}) satisfies z.ZodType<Effect>;
