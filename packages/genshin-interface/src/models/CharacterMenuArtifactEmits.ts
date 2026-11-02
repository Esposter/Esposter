// The Artifacts panel's actions, each naming the slot it is taken on by its index, which the panel re-emits from its foot
export interface CharacterMenuArtifactEmits {
  enhance: [index: number];
  equip: [index: number];
  lock: [index: number];
  unequip: [index: number];
}
