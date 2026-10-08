import type { Weapon } from "#src/models/weapon/Weapon";

// The EXP a weapon has been levelled with: each level it rose past from level 1, and what it holds towards the next
export const getWeaponInvestedExp = (
  { experience, level }: Pick<Weapon, "experience" | "level">,
  requiredExps: readonly number[],
): number => requiredExps.slice(0, level - 1).reduce((sum, requiredExp) => sum + requiredExp, experience);
