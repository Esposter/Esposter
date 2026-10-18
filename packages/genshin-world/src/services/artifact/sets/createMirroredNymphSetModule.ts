import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { getActiveCharacterId } from "#src/services/party/getActiveCharacterId";
import { ID_SEPARATOR, takeOne } from "@esposter/shared";

const MIRRORED_NYMPH_ID = "mirroredNymph";
// The attacks of the wearer's own that each keep a stack of their kind, which a later hit of the kind refreshes
const MIRRORED_NYMPH_ATTACK_TAGS = [
  AttackTag.NormalAttack,
  AttackTag.ChargedAttack,
  AttackTag.PlungingAttack,
  AttackTag.ElementalSkill,
  AttackTag.ElementalBurst,
];

const getMirroredNymphStackId = (attackTag: AttackTag): string => `${MIRRORED_NYMPH_ID}${ID_SEPARATOR}${attackTag}`;

// Counts the kinds of attack whose stack the wearer holds, each kind counting once however many hits it has landed
const countMirroredNymphStacks = (effects: readonly KitEffect[], characterId: number): number =>
  MIRRORED_NYMPH_ATTACK_TAGS.filter((attackTag) =>
    checkIsKitStatusActive(effects, characterId, getMirroredNymphStackId(attackTag)),
  ).length;

// Mirrored Nymph. Its four-piece bonus gives its wearer, while it stands on the field, a stack of the kind of attack for the first
// Param's seconds on each hit of an enemy by its Normal, Charged or Plunging Attack, Elemental Skill or Elemental Burst. A later hit of
// The same kind refreshes that stack, and the five kinds' stacks count separately. One, two and three or more stacks raise its ATK by
// The second, third and fourth params, and its Hydro DMG by the fifth, sixth and seventh
export const createMirroredNymphSetModule = (bonus: ArtifactSetBonus): PassiveModule => {
  const seconds = takeOne(bonus.params, 0);
  return {
    getPassiveBonuses: (combatant, _healthShare, _deployedCombatants, effects) => {
      const { characterId } = combatant;
      const count = countMirroredNymphStacks(effects, characterId);
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
        event.kind !== KitEventKind.DamageTaken ||
        event.striker.characterId !== characterId ||
        !event.attackTag ||
        !MIRRORED_NYMPH_ATTACK_TAGS.includes(event.attackTag) ||
        getActiveCharacterId(party) !== characterId
      )
        return;
      addKitStatus(kitEffectState, characterId, {
        id: getMirroredNymphStackId(event.attackTag),
        secondsRemaining: seconds,
      });
    },
  };
};
