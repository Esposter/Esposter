import { WikiInternalCooldownTag } from "#src/models/genshinAssets/kits/wiki/WikiInternalCooldownTag";
import { InternalCooldownTag } from "genshin-world";

// The wiki's ICD tags as its Advanced Properties write them, as the kit names the ones it holds
export const WikiInternalCooldownTagMap: Partial<Record<string, InternalCooldownTag>> = {
  [WikiInternalCooldownTag.ChargedAttack]: InternalCooldownTag.ChargedAttack,
  [WikiInternalCooldownTag.ElementalBurst]: InternalCooldownTag.ElementalBurst,
  [WikiInternalCooldownTag.ElementalSkill]: InternalCooldownTag.ElementalSkill,
  [WikiInternalCooldownTag.NormalAttack]: InternalCooldownTag.NormalAttack,
  [WikiInternalCooldownTag.VesnaElementalSkillStart]: InternalCooldownTag.VesnaElementalSkillStart,
};
