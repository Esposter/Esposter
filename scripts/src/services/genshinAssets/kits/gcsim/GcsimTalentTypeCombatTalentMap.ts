import { GcsimTalentType } from "#src/models/genshinAssets/kits/gcsim/GcsimTalentType";
import { CombatTalent } from "genshin-world";

// The combat talent each gcsim talent type's multipliers belong to, and so the proud skill group its table holds them in
export const GcsimTalentTypeCombatTalentMap: Record<GcsimTalentType, CombatTalent> = {
  [GcsimTalentType.Attack]: CombatTalent.NormalAttack,
  [GcsimTalentType.Burst]: CombatTalent.ElementalBurst,
  [GcsimTalentType.Skill]: CombatTalent.ElementalSkill,
};
