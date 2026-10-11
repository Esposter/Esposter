import type { KitEffect } from "#src/models/kit/KitEffect";
import type { Kit } from "#src/models/kit/Kit";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitStance } from "#src/models/kit/KitStance";

import { AttackTag } from "#src/models/combat/AttackTag";

const getStanceAttackTag = (stance: KitStance, hit: KitHit): AttackTag | undefined => {
  if (stance.actions.normalAttacks.some(({ hits }) => hits.includes(hit))) return stance.attackTags.normalAttacks;
  if (stance.actions.chargedAttack.hits.includes(hit)) return stance.attackTags.chargedAttack;
  if (stance.actions.elementalSkill.hits.includes(hit)) return stance.attackTags.elementalSkill;
  if (stance.actions.elementalBurst.hits.includes(hit)) return stance.attackTags.elementalBurst;
  return undefined;
};

// The kind of attack a hit is dealt as: a stance's hit reads the stance's own damage type, whatever list of the kit it
// Sits in, and a hit of the kit's own actions reads the action it belongs to. None for a hit no action holds, such as a
// Summon's
export const getKitAttackTag = (kit: Kit, hit: KitHit, effects: readonly KitEffect[]): AttackTag | undefined => {
  for (const effect of effects) {
    if (effect.kind !== "stance") continue;
    const stanceAttackTag = getStanceAttackTag(effect, hit);
    if (stanceAttackTag) return stanceAttackTag;
  }
  if (kit.normalAttacks.some(({ hits }) => hits.includes(hit))) return AttackTag.NormalAttack;
  if (kit.chargedAttack.hits.includes(hit)) return AttackTag.ChargedAttack;
  if (hit === kit.plungeCollision || kit.lowPlunge.hits.includes(hit) || kit.highPlunge.hits.includes(hit))
    return AttackTag.PlungingAttack;
  const burstActions = [kit.elementalBurst, ...(kit.elementalBurstVariant ? [kit.elementalBurstVariant.action] : [])];
  if (burstActions.some(({ hits }) => hits.includes(hit))) return AttackTag.ElementalBurst;
  const skillActions = [
    kit.elementalSkill,
    ...(kit.elementalSkillChain?.followUps ?? []),
    ...(kit.elementalSkillHolds ?? []).flatMap(({ action, variant }) =>
      variant ? [action, variant.action] : [action],
    ),
  ];
  return skillActions.some(({ hits }) => hits.includes(hit)) ? AttackTag.ElementalSkill : undefined;
};
