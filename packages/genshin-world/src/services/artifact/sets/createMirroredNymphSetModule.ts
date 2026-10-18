import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { countKitHolds } from "#src/services/kit/effects/countKitHolds";
import { ID_SEPARATOR, takeOne } from "@esposter/shared";

const MIRRORED_NYMPH_ID = "mirroredNymph";
// The attacks of the wearer's own that produce a stack on each hit of an enemy
const MIRRORED_NYMPH_ATTACK_TAGS = [
  AttackTag.NormalAttack,
  AttackTag.ChargedAttack,
  AttackTag.PlungingAttack,
  AttackTag.ElementalSkill,
  AttackTag.ElementalBurst,
];

const getMirroredNymphStackId = (index: number): string => `${MIRRORED_NYMPH_ID}${ID_SEPARATOR}${index}`;

// Adds a stack in the first place of its id that is free. A stack has no maximum, so the places run on as far as the stacks do
const addMirroredNymphStack = (kitEffectState: KitEffectState, characterId: number, seconds: number): void => {
  let index = 0;
  while (checkIsKitStatusActive(kitEffectState.effects, characterId, getMirroredNymphStackId(index))) index++;
  addKitStatus(kitEffectState, characterId, { id: getMirroredNymphStackId(index), secondsRemaining: seconds });
};

// Mirrored Nymph. Its four-piece bonus gives its wearer a stack for the first param's seconds on each hit of an enemy by its
// Normal, Charged or Plunging Attack, Elemental Skill or Elemental Burst, each stack running its own seconds. One, two and three
// Or more stacks raise its ATK by the second, third and fourth params, and its Hydro DMG by the fifth, sixth and seventh
export const createMirroredNymphSetModule = (bonus: ArtifactSetBonus): PassiveModule => {
  const seconds = takeOne(bonus.params, 0);
  return {
    getPassiveBonuses: (combatant, _healthShare, _deployedCombatants, effects) => {
      const { characterId } = combatant;
      const count = countKitHolds(effects, characterId, MIRRORED_NYMPH_ID);
      if (count === 0) return [];
      const tier = Math.min(count, 3) - 1;
      return [
        { amount: takeOne(bonus.params, 1 + tier) ?? 0, attribute: Attribute.AttackPercent },
        { amount: takeOne(bonus.params, 4 + tier) ?? 0, attribute: Attribute.HydroDamageBonus },
      ];
    },
    onKitEvent: (event, context, combatant) => {
      const { characterId } = combatant;
      if (
        event.kind !== KitEventKind.DamageTaken ||
        event.striker.characterId !== characterId ||
        !event.attackTag ||
        !MIRRORED_NYMPH_ATTACK_TAGS.includes(event.attackTag)
      )
        return;
      addMirroredNymphStack(context.kitEffectState, characterId, seconds);
    },
  };
};
