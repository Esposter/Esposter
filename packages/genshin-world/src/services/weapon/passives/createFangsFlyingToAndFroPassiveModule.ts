import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { countDeployedElements } from "#src/services/party/countDeployedElements";
import { takeOne } from "@esposter/shared";

const FANGS_FLYING_TO_AND_FRO_ID = "fangsFlyingToAndFro";
const FANGS_FLYING_TO_AND_FRO_COOLDOWN_ID = "fangsFlyingToAndFroCooldown";

// Fangs Flying To and Fro (Waveriding Whirl) at its rank: an Elemental Skill its wielder uses raises its Max HP by the
// Rank's amount for the rank's seconds, once every cooldown, and by the rank's further amount for each Hydro member of
// The deployed team, the wielder among them, up to the rank's count, as gcsim's waveridingwhirl.go counts the party's
// Hydro characters. Its Swimming Stamina line is not read, as the world's stamina takes no consumption multiplier yet
export const createFangsFlyingToAndFroPassiveModule = (params: number[]): PassiveModule => {
  const healthPercent = takeOne(params, 1);
  const seconds = takeOne(params, 2);
  const cooldownSeconds = takeOne(params, 3);
  const healthPercentPerHydroMember = takeOne(params, 4);
  const maximumHydroMembers = takeOne(params, 5);
  return {
    getPassiveBonuses: ({ characterId }, _healthShare, deployedCombatants, effects) => {
      if (!checkIsKitStatusActive(effects, characterId, FANGS_FLYING_TO_AND_FRO_ID)) return [];
      const hydroMembers = countDeployedElements(
        deployedCombatants.map(({ element }) => element),
        [Element.Hydro],
      );
      return [
        {
          amount: healthPercent + healthPercentPerHydroMember * Math.min(hydroMembers, maximumHydroMembers),
          attribute: Attribute.HealthPercent,
        },
      ];
    },
    onKitEvent: (event, { kitEffectState }, { characterId }) => {
      if (
        event.kind !== KitEventKind.SkillUsed ||
        event.characterId !== characterId ||
        !startKitCooldown(kitEffectState, characterId, FANGS_FLYING_TO_AND_FRO_COOLDOWN_ID, cooldownSeconds)
      )
        return;
      addKitStatus(kitEffectState, characterId, { id: FANGS_FLYING_TO_AND_FRO_ID, secondsRemaining: seconds });
    },
  };
};
