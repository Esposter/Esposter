import type { Element } from "#src/models/Element";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { emitKitEvent } from "#src/services/kit/emitKitEvent";
import { NATLAN_REGION_ID } from "#src/services/natlan/constants";
import { getDeployedCombatants } from "#src/services/party/getDeployedCombatants";

// The seconds a Nightsoul burst waits for the next, by the party's Natlan members, as gcsim (MIT) setupNightsoulBurst's
// nightsoulBurstICD gives them: 18 for one, 12 for two, and 9 for three or four
const NIGHTSOUL_BURST_INTERVAL_SECONDS = [0, 18, 12, 9, 9];

// A party member's Elemental DMG on an enemy sets off the team's Nightsoul burst while a Natlan character is in the party and
// The interval since the last one has run out, as the Natlan wiki page and gcsim give it. A hit with no element, a physical
// One, sets off none. The interval is the team's, held under the team's id, and the burst goes to every kit of the team
export const triggerKitNightsoulBurst = (
  enemy: Enemy,
  striker: Combatant,
  element: Element | undefined,
  context: KitContext,
): void => {
  if (element === undefined) return;
  const { characterIdCombatantMap, party } = context;
  const natlanCount = getDeployedCombatants(party, characterIdCombatantMap).filter(
    ({ regionId }) => regionId === NATLAN_REGION_ID,
  ).length;
  if (natlanCount === 0 || party.nightsoulBurstCooldownSeconds > 0) return;
  party.nightsoulBurstCooldownSeconds = NIGHTSOUL_BURST_INTERVAL_SECONDS[Math.min(natlanCount, 4)] ?? 0;
  emitKitEvent({ enemy, kind: KitEventKind.NightsoulBurst, striker }, context);
};
