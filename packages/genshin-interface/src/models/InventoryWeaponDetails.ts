// A weapon's details in the bag's detail panel, each word and text already in the reader's language.
// They are its kind, its base ATK and its secondary stat, each as a label and a value.
// Its passive's name and text, its refinement rank and its description follow.
export interface InventoryWeaponDetails {
  baseAttack: { label: string; value: string };
  description: string;
  kind: string;
  passiveName: string;
  passiveText: string;
  refinement: number;
  secondaryStat: { label: string; value: string };
}
