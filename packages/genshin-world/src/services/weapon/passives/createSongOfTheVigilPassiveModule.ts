import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { checkIsOwnReactionTriggered } from "#src/services/kit/checkIsOwnReactionTriggered";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { createStellarGlimmerBuffPassiveModule } from "#src/services/weapon/passives/createStellarGlimmerBuffPassiveModule";
import { takeOne } from "@esposter/shared";

const SONG_OF_THE_VIGIL_COOLDOWN_ID = "songOfTheVigilCooldown";
const SONG_OF_THE_VIGIL_SOURCE = "songOfTheVigil";

// Song of the Vigil at its rank: after its wielder triggers an Elemental Reaction, it regenerates the rank's Energy to the
// Wielder, at most once every cooldown the rank gives in seconds, and a Stellar Glimmer reaction it triggers raises the
// Wielder's ATK by the rank's percentage for the rank's seconds. The effects count whether or not the wielder is on the field
export const createSongOfTheVigilPassiveModule = (params: number[]): PassiveModule => {
  const energy = takeOne(params, 0);
  const cooldownSeconds = takeOne(params, 2);
  const stellarBuffPassiveModule = createStellarGlimmerBuffPassiveModule([takeOne(params, 1), takeOne(params, 3)], {
    attribute: Attribute.AttackPercent,
    source: SONG_OF_THE_VIGIL_SOURCE,
  });
  return {
    onKitEvent: (event, context, combatant) => {
      if (!checkIsOwnReactionTriggered(event, combatant)) return;
      if (
        startKitCooldown(context.kitEffectState, combatant.characterId, SONG_OF_THE_VIGIL_COOLDOWN_ID, cooldownSeconds)
      )
        gainPartyMemberEnergy(context.party, combatant, energy);
      stellarBuffPassiveModule.onKitEvent?.(event, context, combatant);
    },
  };
};
