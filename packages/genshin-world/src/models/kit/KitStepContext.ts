import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { Party } from "#src/models/party/Party";

// What a kit's step reads beyond its input: the body the character stands as, the character on the field as its combatant,
// The effects on the team, which a passive, a field or a cooldown reads as the step runs, and the deployed team's party, whose
// HP a skill's cost or a burst's variant reads
export interface KitStepContext {
  body: KitBody;
  combatant: Combatant;
  kitEffectState: KitEffectState;
  party: Party;
}
