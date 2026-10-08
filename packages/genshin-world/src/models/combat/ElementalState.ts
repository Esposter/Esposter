import type { Aura } from "#src/models/combat/Aura";
import type { AuraType } from "#src/models/combat/AuraType";
import type { InternalCooldown } from "#src/models/combat/InternalCooldown";

// One target's elements, written in place: its auras, its own clock in seconds, when its Burning and its Electro-Charged
// Last ticked and it last crystallized, and the cooldown its Burning applies Pyro under
export interface ElementalState {
  auras: Map<AuraType, Aura>;
  burningInternalCooldown: InternalCooldown;
  burningSeconds: number;
  crystallizeSeconds: number;
  electroChargedSeconds: number;
  seconds: number;
}
