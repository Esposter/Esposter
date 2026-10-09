import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

// What a kit's step reads beyond its input: the body the character stands as, the character on the field as its combatant, and
// The effects on the team, which a passive, a field or a cooldown reads as the step runs
export interface KitStepContext {
  body: KitBody;
  combatant: Combatant;
  kitEffectState: KitEffectState;
}
