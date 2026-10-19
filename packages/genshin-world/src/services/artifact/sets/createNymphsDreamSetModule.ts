import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsActiveCharacterHit } from "#src/services/artifact/sets/checkIsActiveCharacterHit";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { ID_SEPARATOR, takeOne } from "@esposter/shared";

const NYMPHS_DREAM_ID = "nymphsDream";
// The attacks of the wearer's own that each keep a stack of their kind, which a later hit of the kind refreshes
const NYMPHS_DREAM_ATTACK_TAGS = [
  AttackTag.NormalAttack,
  AttackTag.ChargedAttack,
  AttackTag.PlungingAttack,
  AttackTag.ElementalSkill,
  AttackTag.ElementalBurst,
];

const getNymphsDreamStackId = (attackTag: AttackTag): string => `${NYMPHS_DREAM_ID}${ID_SEPARATOR}${attackTag}`;

// Counts the kinds of attack whose stack the wearer holds, each kind counting once however many hits it has landed
const countNymphsDreamStacks = (effects: readonly KitEffect[], characterId: number): number =>
  NYMPHS_DREAM_ATTACK_TAGS.filter((attackTag) =>
    checkIsKitStatusActive(effects, characterId, getNymphsDreamStackId(attackTag)),
  ).length;

// Nymph's Dream. Its four-piece bonus gives its wearer, while it stands on the field, a stack of the kind of attack for
// The first param's seconds on each hit of an enemy by its Normal, Charged or Plunging Attack, Elemental Skill or
// Elemental Burst. A later hit of the same kind refreshes that stack, and the five kinds' stacks count separately. One,
// Two and three or more stacks raise its ATK by the second, third and fourth params, and its Hydro DMG by the fifth,
// Sixth and seventh
export const createNymphsDreamSetModule = (bonus: ArtifactSetBonus): PassiveModule => {
  const seconds = takeOne(bonus.params, 0);
  return {
    getPassiveBonuses: (combatant, _healthShare, _deployedCombatants, effects) => {
      const { characterId } = combatant;
      const count = countNymphsDreamStacks(effects, characterId);
      if (count === 0) return [];
      const tier = Math.min(count, 3) - 1;
      return [
        { amount: takeOne(bonus.params, 1 + tier), attribute: Attribute.AttackPercent },
        { amount: takeOne(bonus.params, 4 + tier), attribute: Attribute.HydroDamageBonus },
      ];
    },
    onKitEvent: (event, context, combatant) => {
      const { characterId } = combatant;
      const { kitEffectState, party } = context;
      if (
        !checkIsActiveCharacterHit(event, party, combatant) ||
        !event.attackTag ||
        !NYMPHS_DREAM_ATTACK_TAGS.includes(event.attackTag)
      )
        return;
      addKitStatus(kitEffectState, characterId, {
        id: getNymphsDreamStackId(event.attackTag),
        secondsRemaining: seconds,
      });
    },
  };
};
