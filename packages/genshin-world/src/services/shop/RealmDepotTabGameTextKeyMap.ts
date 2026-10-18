import { GameTextKey } from "genshin-text";

// The name each of the Realm Depot's tabs shows, by the table's sub tab id its goods carry. The Furnishings tab shows the
// Bag's Furnishings, which is the same word
export const RealmDepotTabGameTextKeyMap: Readonly<Record<number, GameTextKey>> = {
  1: GameTextKey.RealmDepotTreasures,
  2: GameTextKey.InventoryFurnishings,
  3: GameTextKey.RealmDepotBlueprints,
  4: GameTextKey.RealmDepotRiches,
  5: GameTextKey.RealmDepotCreatures,
  6: GameTextKey.RealmDepotWood,
};
