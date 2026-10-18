// What a step of the Sheer Cold gauge reads off the world: whether heat is near the character, whether the character
// Stands in the subzero climate, and whether it is swimming
export interface SheerColdStep {
  isHeated: boolean;
  isInCold: boolean;
  isSwimming: boolean;
}
