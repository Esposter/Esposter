import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { checkIsOwnReactionTriggered } from "#src/services/kit/checkIsOwnReactionTriggered";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { takeOne } from "@esposter/shared";

const WHISPERS_OF_WIND_AND_FLOWER_SOURCE = "whispersOfWindAndFlower";

// Whispers of Wind and Flower at its rank: for the rank's seconds after its wielder's Elemental Skill hits an opponent or
// The wielder triggers an Elemental Reaction, its ATK and Elemental Mastery rise by the rank's amounts. Each one restarts
// The buffs it raises
export const createWhispersOfWindAndFlowerPassiveModule = (params: number[]): PassiveModule => {
  const seconds = takeOne(params, 0);
  const attackPercentage = takeOne(params, 1);
  const elementalMastery = takeOne(params, 2);
  return {
    onKitEvent: (event, { kitEffectState }, combatant) => {
      const isSkillHit =
        event.kind === KitEventKind.DamageTaken &&
        event.striker.characterId === combatant.characterId &&
        event.attackTag === AttackTag.ElementalSkill;
      if (!isSkillHit && !checkIsOwnReactionTriggered(event, combatant)) return;
      buffKitMember(kitEffectState, combatant.characterId, {
        amount: attackPercentage,
        attribute: Attribute.AttackPercent,
        secondsRemaining: seconds,
        source: WHISPERS_OF_WIND_AND_FLOWER_SOURCE,
      });
      buffKitMember(kitEffectState, combatant.characterId, {
        amount: elementalMastery,
        attribute: Attribute.ElementalMastery,
        secondsRemaining: seconds,
        source: WHISPERS_OF_WIND_AND_FLOWER_SOURCE,
      });
    },
  };
};
