import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitSummon } from "#src/models/kit/KitSummon";
import type { Except } from "type-fest";

import { SUMMON_LINGER_SECONDS } from "#src/services/kit/constants";
import { copyKitBody } from "#src/services/kit/copyKitBody";

// A summon cast where its body stands, which lands its hits from there for its seconds, priced by the combatant that cast
// It as it stood then, with the fields its kit names beside them. It copies the body, so the summon stays where it was
// Cast. Its seconds default to SUMMON_LINGER_SECONDS past its last hit, so the step that lands that hit still has it on the
// Field, and a summon with no hit lingers that long from its cast
export const createKitSummon = (
  body: KitBody,
  combatant: Combatant,
  hits: KitHit[],
  {
    secondsRemaining = Math.max(0, ...hits.map(({ hitmarkSeconds }) => hitmarkSeconds)) + SUMMON_LINGER_SECONDS,
    ...fields
  }: Partial<Except<KitSummon, "body" | "combatant" | "hits" | "kind" | "nextHitIndex">> = {},
): KitSummon => ({
  body: copyKitBody(body),
  combatant,
  elapsedSeconds: 0,
  hits,
  kind: "summon",
  nextHitIndex: 0,
  ...fields,
  secondsRemaining,
});
