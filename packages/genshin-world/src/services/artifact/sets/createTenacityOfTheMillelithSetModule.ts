import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { buffKitTeam } from "#src/services/kit/effects/buffKitTeam";
import { startKitElementalSkillHitCooldown } from "#src/services/kit/effects/startKitElementalSkillHitCooldown";
import { takeOne } from "@esposter/shared";

const TENACITY_OF_THE_MILLELITH_COOLDOWN_ID = "tenacityOfTheMillelithCooldown";

// Tenacity of the Millelith. Its four-piece bonus, when its wearer's Elemental Skill hits an opponent, gives every deployed
// Member the first param's ATK and the second's Shield Strength for the third param's seconds. It triggers once in the fourth
// Param's seconds, and whether or not its wearer is on the field
export const createTenacityOfTheMillelithSetModule = (bonus: ArtifactSetBonus): PassiveModule => {
  const attackPercent = takeOne(bonus.params, 0);
  const shieldStrength = takeOne(bonus.params, 1);
  const seconds = takeOne(bonus.params, 2);
  const cooldownSeconds = takeOne(bonus.params, 3);
  return {
    onKitEvent: (event, context, combatant) => {
      if (
        !startKitElementalSkillHitCooldown(
          event,
          context.kitEffectState,
          combatant,
          TENACITY_OF_THE_MILLELITH_COOLDOWN_ID,
          cooldownSeconds,
        )
      )
        return;
      buffKitTeam(context.kitEffectState, context.party, {
        amount: attackPercent,
        attribute: Attribute.AttackPercent,
        secondsRemaining: seconds,
        source: "tenacityOfTheMillelith",
      });
      buffKitTeam(context.kitEffectState, context.party, {
        amount: shieldStrength,
        attribute: Attribute.ShieldStrength,
        secondsRemaining: seconds,
        source: "tenacityOfTheMillelith",
      });
    },
  };
};
