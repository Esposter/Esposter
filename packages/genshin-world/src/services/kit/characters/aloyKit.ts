import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { Element } from "#src/models/Element";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkHasKitStatus } from "#src/services/kit/effects/checkHasKitStatus";
import { gainKitResource } from "#src/services/kit/effects/gainKitResource";
import { spendKitResource } from "#src/services/kit/effects/spendKitResource";

// The coil stacks a Chillwater Bomblet adds, and the stacks at which Rushing Ice takes them and infuses Aloy's attacks.
// Provisional: gcsim gives the coils no end while Aloy is on the field, so they are a resource Rushing Ice spends
const COIL_RUSHING_ICE_STACKS = 4;
const COIL_RESOURCE_ID = "aloy-coil";
const RUSHING_ICE_STATUS_ID = "aloy-rushing-ice";

export const ALOY_CHARACTER_ID = 10_000_062;

// Aloy's behaviour: each of Freeze Bomb's two Chillwater Bomblets adds a coil stack as it strikes, and four coil stacks
// Give Cryo infusion for the table's seconds of Rushing Ice. Her Coil and Rushing Ice normal attack bonuses are not built,
// As no kit step reads a normal attack's DMG bonus from the team's effects. Her constellations are not built, as the game
// Cannot activate them
export const createAloyKitBehaviour = ({ readSeconds }: KitRecordReader): KitBehaviour => {
  const rushingIceSeconds = readSeconds("rushingIceDuration");
  // Each Chillwater Bomblet that lands counts a coil stack, and the fourth gives Rushing Ice, which holds off any more coils
  // Until it ends. Provisional: gcsim counts a bomblet once for all the enemies it strikes, where this counts each one
  const addCoilStack = ({ kitEffectState }: KitContext, { combatant }: KitStrike): void => {
    if (checkHasKitStatus(kitEffectState.effects, combatant.characterId, RUSHING_ICE_STATUS_ID)) return;
    if (
      gainKitResource(kitEffectState, combatant.characterId, COIL_RESOURCE_ID, 1, COIL_RUSHING_ICE_STACKS) <
      COIL_RUSHING_ICE_STACKS
    )
      return;
    spendKitResource(kitEffectState, combatant.characterId, COIL_RESOURCE_ID);
    addKitEffect(kitEffectState, {
      characterId: combatant.characterId,
      element: Element.Cryo,
      kind: "infusion",
      secondsRemaining: rushingIceSeconds,
    });
    addKitStatus(kitEffectState, combatant.characterId, {
      id: RUSHING_ICE_STATUS_ID,
      secondsRemaining: rushingIceSeconds,
    });
  };
  // Freeze Bomb's own hit, then its two Chillwater Bomblets
  return { skill: { hits: [{}, { onStrike: addCoilStack }, { onStrike: addCoilStack }] } };
};
