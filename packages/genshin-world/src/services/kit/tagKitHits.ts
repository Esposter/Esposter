import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitHit } from "#src/models/kit/KitHit";

import { AttackTag } from "#src/models/combat/AttackTag";
import { getKitSkillActions } from "#src/services/kit/getKitSkillActions";

const tagHit = (hit: KitHit, attackTag: AttackTag): void => {
  hit.actionAttackTag ??= attackTag;
  hit.attackTag ??= attackTag;
};

const tagActionHits = (actions: readonly KitAction[], attackTag: AttackTag): void => {
  for (const { hits } of actions) for (const hit of hits) tagHit(hit, attackTag);
};

// A kit with each hit of its actions given the kind of attack its action deals, written in place, and dealt as it too
// Unless the hit names its own: a normal attack's, a dash's and a jump's, the charged attack's, a plunge's, the burst's and
// The skill's, in that order, so a hit two actions share is the first's
export const tagKitHits = (kit: Kit): Kit => {
  tagActionHits(kit.normalAttacks, AttackTag.NormalAttack);
  tagActionHits(
    [kit.dash, kit.jump].filter((action): action is KitAction => action !== undefined),
    AttackTag.NormalAttack,
  );
  tagActionHits(
    kit.chargedAttackVariant ? [kit.chargedAttack, kit.chargedAttackVariant.action] : [kit.chargedAttack],
    AttackTag.ChargedAttack,
  );
  tagHit(kit.plungeCollision, AttackTag.PlungingAttack);
  tagActionHits(
    [kit.lowPlunge, kit.highPlunge, ...(kit.plungeVariants ?? []).map(({ action }) => action)],
    AttackTag.PlungingAttack,
  );
  tagActionHits(
    kit.elementalBurstVariant ? [kit.elementalBurst, kit.elementalBurstVariant.action] : [kit.elementalBurst],
    AttackTag.ElementalBurst,
  );
  tagActionHits(getKitSkillActions(kit), AttackTag.ElementalSkill);
  return kit;
};
