import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { createStellarGlimmerBuffPassiveModule } from "#src/services/weapon/passives/createStellarGlimmerBuffPassiveModule";
import { takeOne } from "@esposter/shared";

const SONG_OF_THE_VIGIL_COOLDOWN_ID = "songOfTheVigilCooldown";
const SONG_OF_THE_VIGIL_SOURCE = "songOfTheVigil";

// Song of the Vigil at its rank: after its wielder triggers an Elemental Reaction, it regenerates the rank's Energy to the
// Wielder, at most once every cooldown the rank gives in seconds, and a Stellar Glimmer reaction it triggers raises the
// Wielder's ATK by the rank's percentage for the rank's seconds. The effects count whether or not the wielder is on the field
export const createSongOfTheVigilPassiveModule = (params: number[]): WeaponPassiveModule => {
  const energy = takeOne(params, 0);
  const cooldownSeconds = takeOne(params, 2);
  const stellarBuffPassiveModule = createStellarGlimmerBuffPassiveModule([takeOne(params, 1), takeOne(params, 3)], {
    attribute: Attribute.AttackPercent,
    source: SONG_OF_THE_VIGIL_SOURCE,
  });
  return {
    onKitEvent: (event, context, combatant) => {
      if (event.kind !== KitEventKind.ReactionTriggered || event.striker.characterId !== combatant.characterId) return;
      if (
        !checkIsKitStatusActive(context.kitEffectState.effects, combatant.characterId, SONG_OF_THE_VIGIL_COOLDOWN_ID)
      ) {
        addKitStatus(context.kitEffectState, combatant.characterId, {
          id: SONG_OF_THE_VIGIL_COOLDOWN_ID,
          secondsRemaining: cooldownSeconds,
        });
        gainPartyMemberEnergy(context.party, combatant, energy);
      }
      stellarBuffPassiveModule.onKitEvent?.(event, context, combatant);
    },
  };
};
