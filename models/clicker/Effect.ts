import type { EffectConfiguration } from "@/models/clicker/EffectConfiguration";
import type { Target } from "@/models/clicker/Target";

export interface Effect {
  value: number;
  targets: Target[];
  configuration: EffectConfiguration;
}
