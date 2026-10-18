import type { AttackTag } from "#src/models/combat/AttackTag";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitSwapEndable } from "#src/models/kit/KitSwapEndable";

// An entity placed where its character cast it, which lands its own hits on the seconds its hitmarks fall at, for the
// Seconds left of it. It is priced by the combatant that cast it, as it stood then. A summon that travels moves its body
// Forward at its speed from its start on its clock, and its hits are reached from where it is then
export interface KitSummon extends KitSwapEndable {
  // The kind of attack its hits are dealt as, gcsim's attack tag for them, which its kit names as it casts it, or its
  // Action's own when queueKitHits queues its hits past its end. None for a summon gcsim deals as no kind of attack
  attackTag?: AttackTag;
  body: KitBody;
  combatant: Combatant;
  elapsedSeconds: number;
  hits: KitHit[];
  // The name its character's kit finds it by among the team's effects, if the kit reads it again
  id?: string;
  // Whether the summon moves with the body on the field, standing where that body stands on each step, whoever it is
  isFollowing?: true;
  kind: "summon";
  // The index of its next hit to land, its hits being in the order their hitmarks fall
  nextHitIndex: number;
  // Run as the character on the field starts a normal attack, if the summon coordinates with the normal attacks of
  // Whoever is on the field
  onNormalAttackStart?: (context: KitContext) => void;
  secondsRemaining: number;
  // The seconds from its cast it appears on the field at, if not at once, which a kit asking whether it stands waits for
  spawnSeconds?: number;
  // The Stellar Swirls a summon has taken, which its kit counts to level it up and to explode it
  stacks?: number;
  // The one enemy its hits land on, instead of each enemy their areas reach, if it lands on one
  target?: Enemy;
  travel?: { metresPerSecond: number; startSeconds: number };
}
