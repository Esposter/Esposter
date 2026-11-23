import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { ReactionType } from "#src/models/combat/ReactionType";
import { checkIsOwnReactionTriggered } from "#src/services/kit/checkIsOwnReactionTriggered";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { checkIsReactionNamed } from "#src/services/weapon/passives/checkIsReactionNamed";
import { takeOne } from "@esposter/shared";

const BALLAD_COOLDOWN_ID = "balladOfTheCrossroadsCooldown";
const SACRED_WINE_ID = "bountifulSeaSacredWine";
const LUNAR_REACTIONS = [
  { reactionType: ReactionType.LunarCharged },
  { reactionType: ReactionType.LunarBloom },
  { reactionType: ReactionType.LunarCrystallize },
];

// Ballad of the Crossroads at its rank: a Lunar reaction the wielder triggers restores it the rank's Energy and gives
// The Sacred Wine effect for the rank's seconds, which raises its Max HP by the rank's percentage and the CRIT DMG of
// The Lunar Reaction DMG it deals by the rank's amount. The whole effect is triggered at most once every the rank's
// Cooldown in seconds
export const createBalladOfTheCrossroadsPassiveModule = (params: number[]): PassiveModule => {
  const healthPercentage = takeOne(params, 0);
  const criticalDamageBonus = takeOne(params, 1);
  const seconds = takeOne(params, 2);
  const energy = takeOne(params, 3);
  const cooldownSeconds = takeOne(params, 4);
  return {
    getPartyReactionBonus: (member, reaction, context) =>
      reaction.combatant.characterId === member.characterId &&
      checkIsReactionNamed([reaction], LUNAR_REACTIONS) &&
      checkIsKitStatusActive(context.kitEffectState.effects, member.characterId, SACRED_WINE_ID)
        ? { criticalDamageBonus }
        : {},
    onKitEvent: (event, context, combatant) => {
      if (!checkIsOwnReactionTriggered(event, combatant) || !checkIsReactionNamed(event.reactions, LUNAR_REACTIONS))
        return;
      if (!startKitCooldown(context.kitEffectState, combatant.characterId, BALLAD_COOLDOWN_ID, cooldownSeconds)) return;
      gainPartyMemberEnergy(context.party, combatant, energy);
      addKitStatus(context.kitEffectState, combatant.characterId, { id: SACRED_WINE_ID, secondsRemaining: seconds });
      buffKitMember(context.kitEffectState, combatant.characterId, {
        amount: healthPercentage,
        attribute: Attribute.HealthPercent,
        secondsRemaining: seconds,
        source: SACRED_WINE_ID,
      });
    },
  };
};
