// A material an ascension phase takes as the weapon screen shows it: its name, rarity, the count it takes and the count the bag holds
export interface WeaponAscendCost {
  count: number;
  id: number;
  name: string;
  ownedCount: number;
  rarity: number;
}
