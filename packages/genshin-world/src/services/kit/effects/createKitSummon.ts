import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { SUMMON_LINGER_SECONDS } from "#src/services/kit/constants";

// A summon cast where its body stands, which lands its hits from there for its seconds, priced by the combatant that cast
// It as it stood then. It copies the body, so the summon stays where it was cast. Its seconds default to
// SUMMON_LINGER_SECONDS past its last hit, so the step that lands that hit still has it on the field
export const createKitSummon = (
  { facing, height, position }: KitBody,
  combatant: Combatant,
  hits: KitHit[],
  secondsRemaining = Math.max(...hits.map(({ hitmarkSeconds }) => hitmarkSeconds)) + SUMMON_LINGER_SECONDS,
): KitSummon => ({
  body: { facing, height, position: { x: position.x, z: position.z } },
  combatant,
  elapsedSeconds: 0,
  hits,
  kind: "summon",
  secondsRemaining,
});
