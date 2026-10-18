import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { checkIsKitBuffActive } from "#src/services/kit/effects/checkIsKitBuffActive";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { takeOne } from "@esposter/shared";

const PURIFYING_CROWN_SOURCE = "purifyingCrown";
const ELECTRIFYING_EDICT_ID = "electrifyingEdict";

// Purifying Crown (Fractured Halo) at its rank: a skill or burst its wielder uses raises its ATK by the rank's
// Percentage for the rank's seconds, and a shield it casts while that holds gives it Electrifying Edict for the rank's
// Seconds, every member's Lunar-Charged, a reaction's or a direct hit's alike, dealing the rank's DMG Bonus more. The
// Shield is read as gcsim's fracturedhalo.go reads OnShielded, by the shield's owner while its ATK mod is active
export const createPurifyingCrownPassiveModule = (params: number[]): PassiveModule => {
  const attackPercentage = takeOne(params, 0);
  const attackSeconds = takeOne(params, 1);
  const lunarChargedDamageBonus = takeOne(params, 2);
  const electrifyingEdictSeconds = takeOne(params, 3);
  return {
    getPartyReactionBonus: (member, { reactionType }, { kitEffectState }) =>
      reactionType === LunarReactionType.LunarCharged &&
      checkIsKitStatusActive(kitEffectState.effects, member.characterId, ELECTRIFYING_EDICT_ID)
        ? { damageBonus: lunarChargedDamageBonus }
        : {},
    onKitEvent: (event, { kitEffectState }, { characterId }) => {
      if (
        (event.kind === KitEventKind.SkillUsed || event.kind === KitEventKind.BurstUsed) &&
        event.characterId === characterId
      )
        buffKitMember(kitEffectState, characterId, {
          amount: attackPercentage,
          attribute: Attribute.AttackPercent,
          secondsRemaining: attackSeconds,
          source: PURIFYING_CROWN_SOURCE,
        });
      else if (
        event.kind === KitEventKind.ShieldCast &&
        event.shield.characterId === characterId &&
        checkIsKitBuffActive(kitEffectState.effects, characterId, PURIFYING_CROWN_SOURCE)
      )
        addKitStatus(kitEffectState, characterId, {
          id: ELECTRIFYING_EDICT_ID,
          secondsRemaining: electrifyingEdictSeconds,
        });
    },
  };
};
