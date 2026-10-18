import { AttackTag } from "#src/models/combat/AttackTag";

// Whether a hit is dealt as a normal attack or a charged attack, the two a passive's or a status's bonus on those attacks reads
export const checkIsNormalOrChargedAttack = (attackTag: AttackTag | undefined): boolean =>
  attackTag === AttackTag.NormalAttack || attackTag === AttackTag.ChargedAttack;
