import type { EffectConfiguration } from "#shared/models/clicker/data/effect/EffectConfiguration";
import type { Target } from "#shared/models/clicker/data/Target";

export interface Effect {
  configuration: EffectConfiguration;
  targets: Target[];
  value: number;
}
