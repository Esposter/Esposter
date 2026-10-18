import type { WeaponData } from "#src/models/weapon/WeaponData";
import type { WeaponPassive } from "#src/models/weapon/WeaponPassive";

// A weapon's passive for its screen: its name and each refinement rank's description read from the game's names by
// Text id, in refinement order, the rank the weapon holds marked. A weapon with no passive has none
export const getWeaponPassive = (
  weaponData: WeaponData,
  refinement: number,
  nameText: Readonly<Record<string, string>>,
): undefined | WeaponPassive => {
  if (!weaponData.passiveNameTextId) return undefined;
  return {
    name: nameText[weaponData.passiveNameTextId] || "",
    rows: weaponData.passiveRankDescriptionTextIds.map((textId, index) => ({
      description: nameText[textId] || "",
      isHeld: index + 1 === refinement,
    })),
  };
};
