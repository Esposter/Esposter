import type { Attribute } from "#src/models/character/Attribute";
import type { PassiveModule } from "#src/models/kit/PassiveModule";
import type { WeaponType } from "#src/models/weapon/WeaponType";

// A set's bonus that prices its wearer at the amount in the attribute while the wearer wields one of the weapon types given
export const createWeaponTypeAttackDamageSetModule = ({
  amount,
  attribute,
  weaponTypes,
}: {
  amount: number;
  attribute: Attribute;
  weaponTypes: WeaponType[];
}): PassiveModule => ({
  getPassiveBonuses: (combatant) =>
    combatant.weaponType !== undefined && weaponTypes.includes(combatant.weaponType) ? [{ amount, attribute }] : [],
});
