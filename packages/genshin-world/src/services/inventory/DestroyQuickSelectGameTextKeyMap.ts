import { ItemCategory } from "genshin-interface";
import { GameTextKey } from "genshin-text";

// The quick selects an equipment tab's destroy mode offers, each rarity with the label the game's destroy page gives it:
// It lists a weapon's three rarities and an artifact's four
export const DestroyQuickSelectGameTextKeyMap: Partial<
  Record<ItemCategory, { gameTextKey: GameTextKey; rarity: number }[]>
> = {
  [ItemCategory.Artifact]: [
    { gameTextKey: GameTextKey.InventoryDestroyArtifactOneStar, rarity: 1 },
    { gameTextKey: GameTextKey.InventoryDestroyArtifactTwoStar, rarity: 2 },
    { gameTextKey: GameTextKey.InventoryDestroyArtifactThreeStar, rarity: 3 },
    { gameTextKey: GameTextKey.InventoryDestroyArtifactFourStar, rarity: 4 },
  ],
  [ItemCategory.Weapon]: [
    { gameTextKey: GameTextKey.InventoryDestroyWeaponOneStar, rarity: 1 },
    { gameTextKey: GameTextKey.InventoryDestroyWeaponTwoStar, rarity: 2 },
    { gameTextKey: GameTextKey.InventoryDestroyWeaponThreeStar, rarity: 3 },
  ],
};
