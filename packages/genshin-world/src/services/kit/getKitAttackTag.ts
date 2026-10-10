import type { Kit } from "#src/models/kit/Kit";
import type { KitHit } from "#src/models/kit/KitHit";

import { AttackTag } from "#src/models/combat/AttackTag";

// The kind of attack a hit of a kit's own actions is dealt as, read off the action it belongs to: none for a hit no
// Action of the kit holds, such as a summon's
export const getKitAttackTag = (kit: Kit, hit: KitHit): AttackTag | undefined => {
  if (kit.normalAttacks.some(({ hits }) => hits.includes(hit))) return AttackTag.NormalAttack;
  if (kit.chargedAttack.hits.includes(hit)) return AttackTag.ChargedAttack;
  if (hit === kit.plungeCollision || kit.lowPlunge.hits.includes(hit) || kit.highPlunge.hits.includes(hit))
    return AttackTag.PlungingAttack;
  if (kit.elementalBurst.hits.includes(hit)) return AttackTag.ElementalBurst;
  const skillActions = [
    kit.elementalSkill,
    ...(kit.elementalSkillChain?.followUps ?? []),
    ...(kit.elementalSkillHolds ?? []).flatMap(({ action, variant }) =>
      variant ? [action, variant.action] : [action],
    ),
  ];
  return skillActions.some(({ hits }) => hits.includes(hit)) ? AttackTag.ElementalSkill : undefined;
};
