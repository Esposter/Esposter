import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitStance } from "#src/models/kit/KitStance";
import type { KitStanceActions } from "#src/models/kit/KitStanceActions";

import { AttackTag } from "#src/models/combat/AttackTag";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";

const KIT_STANCE_ATTACK_TAGS: KitStance["attackTags"] = {
  chargedAttack: AttackTag.ChargedAttack,
  elementalBurst: AttackTag.ElementalBurst,
  elementalSkill: AttackTag.ElementalSkill,
  normalAttacks: AttackTag.NormalAttack,
};

// A stance entered on a combatant's character for its seconds, restarting the one it holds: its kit is built once, the
// Combatant's with the stance's actions in place of its own, and each group of them deals its own kind of attack unless
// The stance names another
export const enterKitStance = (
  kitEffectState: KitEffectState,
  { characterId, kit }: Combatant,
  actions: KitStanceActions,
  secondsRemaining: number,
  attackTags = KIT_STANCE_ATTACK_TAGS,
): void =>
  addKitEffect(kitEffectState, {
    attackTags,
    characterId,
    elapsedSeconds: 0,
    kind: "stance",
    kit: { ...kit, ...actions },
    secondsRemaining,
  });
