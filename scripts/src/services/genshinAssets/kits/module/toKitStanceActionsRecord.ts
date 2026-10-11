import type { KitRecordConverter } from "#src/models/genshinAssets/kits/module/KitRecordConverter";
import type { KitStanceActions, KitStanceRecord } from "genshin-world";

// The actions a kit or a stance plays as its record holds them, each from its build of the character's multipliers and
// Of encoded ones
export const toKitStanceActionsRecord = (
  { toAction, toParameter }: KitRecordConverter,
  actions: KitStanceActions,
  encodedActions: KitStanceActions | undefined,
): Required<KitStanceRecord> => ({
  burst: toAction(actions.elementalBurst, encodedActions?.elementalBurst),
  chargedAttack: toAction(actions.chargedAttack, encodedActions?.chargedAttack),
  chargedAttackStamina: toParameter(actions.chargedAttackStamina, encodedActions?.chargedAttackStamina),
  normalAttacks: actions.normalAttacks.map((action, index) => toAction(action, encodedActions?.normalAttacks[index])),
  skill: toAction(actions.elementalSkill, encodedActions?.elementalSkill),
});
