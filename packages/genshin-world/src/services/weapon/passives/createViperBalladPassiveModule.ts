import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitTeam } from "#src/services/kit/effects/buffKitTeam";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { removeKitEffects } from "#src/services/kit/effects/removeKitEffects";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { takeOne } from "@esposter/shared";

const HYMN_OF_THE_PURE_ID = "hymnOfThePure";
const HYMN_OF_THE_PURE_COOLDOWN_ID = "hymnOfThePureCooldown";
const THUS_LIED_THE_VIPER_ID = "thusLiedTheViper";

// Viper's Ballad at its rank: an Elemental Skill or Burst hit its wielder deals adds a stack of Hymn of the Pure, once
// Every cooldown, up to the rank's stacks. The stack that makes the last one clears them and gives Thus Lied the Viper
// Instead, which raises every deployed member's Stellar Glimmer reaction DMG by the rank's amount for the rank's
// Seconds, and holds back any stack for those seconds. The rank's second twelve, the stacks' hold, is the same seconds,
// So it is not read apart
export const createViperBalladPassiveModule = (params: number[]): PassiveModule => {
  const stellarGlimmerDamageBonus = takeOne(params, 0);
  const maximumStacks = takeOne(params, 1);
  const cooldownSeconds = takeOne(params, 2);
  const seconds = takeOne(params, 3);
  return {
    onKitEvent: (event, { kitEffectState, party }, { characterId }) => {
      if (
        event.kind !== KitEventKind.DamageTaken ||
        event.striker.characterId !== characterId ||
        (event.attackTag !== AttackTag.ElementalSkill && event.attackTag !== AttackTag.ElementalBurst) ||
        checkIsKitStatusActive(kitEffectState.effects, characterId, THUS_LIED_THE_VIPER_ID) ||
        !startKitCooldown(kitEffectState, characterId, HYMN_OF_THE_PURE_COOLDOWN_ID, cooldownSeconds)
      )
        return;
      const stacks = (findKitStatus(kitEffectState.effects, characterId, HYMN_OF_THE_PURE_ID)?.stacks ?? 0) + 1;
      if (stacks < maximumStacks) {
        addKitStatus(kitEffectState, characterId, {
          id: HYMN_OF_THE_PURE_ID,
          secondsRemaining: Number.POSITIVE_INFINITY,
          stacks,
        });
        return;
      }
      removeKitEffects(
        kitEffectState,
        (effect) => effect.kind === "status" && effect.characterId === characterId && effect.id === HYMN_OF_THE_PURE_ID,
      );
      addKitStatus(kitEffectState, characterId, { id: THUS_LIED_THE_VIPER_ID, secondsRemaining: seconds });
      buffKitTeam(kitEffectState, party, {
        amount: stellarGlimmerDamageBonus,
        attribute: Attribute.StellarGlimmerReactionDamageBonus,
        secondsRemaining: seconds,
        source: THUS_LIED_THE_VIPER_ID,
      });
    },
  };
};
