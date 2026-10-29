import { GCSIM_CHARGED_ATTACK_TAG } from "#src/services/genshinAssets/kits/constants";
import { AttackTag } from "genshin-world";

// The attack tags gcsim names in an `AttackInfo` literal whose meaning a kit attack tag holds: a normal attack, a charged
// Attack, a plunge, an elemental skill with its hold, and an elemental burst. The Lunar tags are
// GcsimAttackTagLunarReactionTypeMap's, and a tag with no kit attack tag is missing here
export const GcsimAttackTagMap: Partial<Record<string, AttackTag>> = {
  "attacks.AttackTagElementalArt": AttackTag.ElementalSkill,
  "attacks.AttackTagElementalArtHold": AttackTag.ElementalSkill,
  "attacks.AttackTagElementalBurst": AttackTag.ElementalBurst,
  [GCSIM_CHARGED_ATTACK_TAG]: AttackTag.ChargedAttack,
  "attacks.AttackTagNormal": AttackTag.NormalAttack,
  "attacks.AttackTagPlunge": AttackTag.PlungingAttack,
};
