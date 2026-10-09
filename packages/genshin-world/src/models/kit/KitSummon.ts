import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitStepContext } from "#src/models/kit/KitStepContext";

// An entity placed where its character cast it, which lands its own hits on the seconds its hitmarks fall at, for the
// Seconds left of it. It is priced by the combatant that cast it, as it stood then. A summon that travels moves its body
// Forward at its speed from its start on its clock, and its hits are reached from where it is then
export interface KitSummon {
  body: KitBody;
  combatant: Combatant;
  elapsedSeconds: number;
  hits: KitHit[];
  // Whether the summon moves with the body on the field, standing where that body stands on each step, whoever it is
  isFollowing?: true;
  kind: "summon";
  // Run as the character on the field starts a normal attack, given its body and combatant, if the summon coordinates
  // With the normal attacks of whoever is on the field
  onNormalAttackStart?: (context: KitStepContext) => void;
  secondsRemaining: number;
  travel?: { metresPerSecond: number; startSeconds: number };
}
