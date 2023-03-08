import { EffectConfiguration, effectConfigurationSchema } from "@/models/clicker/EffectConfiguration";
import { Target, targetSchema } from "@/models/clicker/Target";
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
