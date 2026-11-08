// Which held mesh each weapon row pairs with, by the row's id: the `_Model` mesh its texture folder names where the asset
// Index holds one, and the ids of the rows it holds none for, recorded as having none in place of a guessed pairing
export interface WeaponMeshMap {
  weaponIdMeshMap: Record<string, string>;
  weaponIdsWithoutMesh: number[];
}
