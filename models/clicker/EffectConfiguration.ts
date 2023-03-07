import type { EffectType } from "@/models/clicker/EffectType";
import type { Target } from "@/models/clicker/Target";

export interface EffectConfiguration {
  type: EffectType;
  // Only used for effect types that are based off other specific targets
  // e.g. BuildingAdditive requires number of buildings (targets)
  targets?: Target[];
}
