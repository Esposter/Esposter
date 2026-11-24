// What exporting the weapon table's icons comes to: the icon names each index block holds, and each name the index
// Holds no texture for
export interface WeaponIconPlan {
  blockNamesMap: Map<string, string[]>;
  missingNames: string[];
}
