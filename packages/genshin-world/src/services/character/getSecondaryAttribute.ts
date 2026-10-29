import type { WeaponData } from "#src/models/weapon/WeaponData";

import { Attribute } from "#src/models/character/Attribute";

// The attribute a weapon grows beside its base ATK, which is its one secondary, or undefined for a weapon that grows none
export const getSecondaryAttribute = ({ growAttributes }: Pick<WeaponData, "growAttributes">): Attribute | undefined =>
  growAttributes.find(({ attribute }) => attribute !== Attribute.BaseAttack)?.attribute;
