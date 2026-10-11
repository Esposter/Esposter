import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";

import { AttackTag } from "#src/models/combat/AttackTag";
import { getKitSkillActions } from "#src/services/kit/getKitSkillActions";

const tagActionHits = (actions: readonly KitAction[], attackTag: AttackTag): void => {
  for (const { hits } of actions) for (const hit of hits) hit.attackTag ??= attackTag;
};

// A kit with each hit of its actions given the kind of attack its action deals, written in place, unless the hit names
// Its own: a normal attack's, the charged attack's, a plunge's, the burst's and the skill's, in that order, so a hit two
// Actions share is dealt as the first's
export const tagKitHits = (kit: Kit): Kit => {
  tagActionHits(kit.normalAttacks, AttackTag.NormalAttack);
  tagActionHits([kit.chargedAttack], AttackTag.ChargedAttack);
  kit.plungeCollision.attackTag ??= AttackTag.PlungingAttack;
  tagActionHits([kit.lowPlunge, kit.highPlunge], AttackTag.PlungingAttack);
  tagActionHits(
    kit.elementalBurstVariant ? [kit.elementalBurst, kit.elementalBurstVariant.action] : [kit.elementalBurst],
    AttackTag.ElementalBurst,
  );
  tagActionHits(getKitSkillActions(kit), AttackTag.ElementalSkill);
  return kit;
};
