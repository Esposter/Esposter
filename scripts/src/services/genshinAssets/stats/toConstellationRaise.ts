import type { Constellation } from "genshin-world";

import { PROUD_SKILL_SLOT_MODULUS } from "#src/services/genshinAssets/stats/constants";
import { toSkillAction } from "#src/services/genshinAssets/stats/toSkillAction";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { CombatTalent } from "genshin-world";

// The talent a constellation's skill action raises, from its actions in the dump: the one skill action, its levels and
// The combat talent whose proud skill group ends in its slot. The skill the description names must be that talent's own,
// So a table that moved a slot is refused rather than raising the wrong talent. A constellation with no skill action
// Raises none, which is every one but the third and fifth
export const toConstellationRaise = (
  actions: readonly Record<string, unknown>[],
  {
    descriptionText,
    proudSkillGroupIds,
    skillNames,
  }: {
    descriptionText: string;
    proudSkillGroupIds: Readonly<Record<CombatTalent, number>>;
    skillNames: Readonly<Record<CombatTalent, string>>;
  },
): Constellation["raise"] => {
  const skillActions = actions.flatMap((action) => {
    const skillAction = toSkillAction(action);
    return skillAction === undefined ? [] : [skillAction];
  });
  if (skillActions.length > 1)
    throw new InvalidOperationError(Operation.Read, toConstellationRaise.name, "more than one skill action");
  const [skillAction] = skillActions;
  if (!skillAction) return undefined;

  const talent = Object.values(CombatTalent).find(
    (candidate) => proudSkillGroupIds[candidate] % PROUD_SKILL_SLOT_MODULUS === skillAction.slot,
  );
  if (talent === undefined)
    throw new InvalidOperationError(Operation.Read, toConstellationRaise.name, `no skill in slot ${skillAction.slot}`);
  const namedTalents = Object.values(CombatTalent).filter((candidate) =>
    descriptionText.includes(skillNames[candidate]),
  );
  if (namedTalents.length !== 1 || namedTalents[0] !== talent)
    throw new InvalidOperationError(
      Operation.Read,
      toConstellationRaise.name,
      `the description does not name ${talent}`,
    );
  return { levels: skillAction.levels, talent };
};
