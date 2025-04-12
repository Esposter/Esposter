import type { EffectConfiguration } from "#shared/models/clicker/data/effect/EffectConfiguration";
import type { Target } from "#shared/models/clicker/data/Target";
import type { Type } from "arktype";

import { effectConfigurationSchema } from "#shared/models/clicker/data/effect/EffectConfiguration";
import { targetSchema } from "#shared/models/clicker/data/Target";
import { type } from "arktype";

export interface Effect {
  configuration: EffectConfiguration;
  targets: Target[];
  value: number;
}

export const effectSchema = type({
  configuration: effectConfigurationSchema,
  targets: targetSchema.array().moreThanLength(0),
  value: "number",
}) satisfies Type<Effect>;
