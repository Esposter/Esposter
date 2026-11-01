// The game's rule for destroying an entry, as its weapon, material and artifact tables spell it: an entry that cannot
// Be destroyed, or one whose destruction returns its materials
export enum DestroyRule {
  None = "DESTROY_NONE",
  ReturnMaterial = "DESTROY_RETURN_MATERIAL",
}
