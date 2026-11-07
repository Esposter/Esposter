// The fields one row of the game's monster table gives a path name: its id, its name in the dump, and the 64-bit path
// Hashes of its prefab, its Animator controller and its combat config, each as the decimal text the dump holds it in.
// Since a number keeps only those hashes' high bits and rounds their low bits away. A row the dump leaves a hash out of
// Holds none
export interface MonsterAssetRow {
  combatConfigHash?: string;
  controllerPathHash?: string;
  id: number;
  monsterName: string;
  prefabPathHash?: string;
}
