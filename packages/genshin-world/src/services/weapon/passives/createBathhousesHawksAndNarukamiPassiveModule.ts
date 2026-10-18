import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { ReactionType } from "#src/models/combat/ReactionType";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { checkIsReactionNamed } from "#src/services/weapon/passives/checkIsReactionNamed";
import { takeOne } from "@esposter/shared";

const SWIRL_REACTIONS = [{ reactionType: ReactionType.Swirl }, { reactionType: ReactionType.StellarSwirl }];

// Bathhouses, Hawks, and Narukami at its rank: Elemental Mastery rises by the rank's amount for its seconds after its wielder
// Triggers a Swirl or a Stellar Swirl, by the second amount for the second seconds after its Elemental Skill hits an opponent,
// And by the third amount for the third seconds after its Elemental Burst hits one
export const createBathhousesHawksAndNarukamiPassiveModule = (params: number[]): WeaponPassiveModule => {
  const swirlMastery = takeOne(params, 0);
  const skillMastery = takeOne(params, 1);
  const burstMastery = takeOne(params, 2);
  const swirlSeconds = takeOne(params, 3);
  const skillSeconds = takeOne(params, 4);
  const burstSeconds = takeOne(params, 5);
  return {
    onKitEvent: (event, { kitEffectState }, combatant) => {
      const { characterId } = combatant;
      if (
        event.kind === KitEventKind.ReactionTriggered &&
        event.striker.characterId === characterId &&
        checkIsReactionNamed(event.reactions, SWIRL_REACTIONS)
      )
        buffKitMember(kitEffectState, characterId, {
          amount: swirlMastery,
          attribute: Attribute.ElementalMastery,
          secondsRemaining: swirlSeconds,
          source: "bathhousesSwirl",
        });
      else if (
        event.kind === KitEventKind.DamageTaken &&
        event.striker.characterId === characterId &&
        event.attackTag === AttackTag.ElementalSkill
      )
        buffKitMember(kitEffectState, characterId, {
          amount: skillMastery,
          attribute: Attribute.ElementalMastery,
          secondsRemaining: skillSeconds,
          source: "bathhousesSkill",
        });
      else if (
        event.kind === KitEventKind.DamageTaken &&
        event.striker.characterId === characterId &&
        event.attackTag === AttackTag.ElementalBurst
      )
        buffKitMember(kitEffectState, characterId, {
          amount: burstMastery,
          attribute: Attribute.ElementalMastery,
          secondsRemaining: burstSeconds,
          source: "bathhousesBurst",
        });
    },
  };
};
