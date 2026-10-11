import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { Party } from "#src/models/party/Party";

import { MoonsignLevel } from "#src/models/combat/MoonsignLevel";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { removeKitEffects } from "#src/services/kit/effects/removeKitEffects";
import { ASCENDANT_GLEAM_SECONDS, ASCENDANT_GLEAM_STATUS_ID } from "#src/services/party/constants";
import { getMoonsignLevel } from "#src/services/party/getMoonsignLevel";

// Ascendant Gleam lit by a character's skill or burst as it starts, written into the team's effects: while the deployed
// Team's Moonsign is Ascendant Gleam, a character outside the Moonsign lights it on itself for its seconds, replacing
// The one another lit, as gcsim (MIT) pkg/simulation/setup.go gives every member one reaction bonus by one key. A
// Moonsign character's skill or burst lights none
export const lightAscendantGleam = (
  kitEffectState: KitEffectState,
  { characterId }: Combatant,
  characterIdCombatantMap: ReadonlyMap<number, Combatant>,
  party: Party,
): void => {
  if (
    characterIdCombatantMap.get(characterId)?.kit.moonsignBenediction !== undefined ||
    getMoonsignLevel(characterIdCombatantMap, party) !== MoonsignLevel.AscendantGleam
  )
    return;
  removeKitEffects(kitEffectState, (effect) => effect.kind === "status" && effect.id === ASCENDANT_GLEAM_STATUS_ID);
  addKitStatus(kitEffectState, characterId, {
    id: ASCENDANT_GLEAM_STATUS_ID,
    secondsRemaining: ASCENDANT_GLEAM_SECONDS,
  });
};
