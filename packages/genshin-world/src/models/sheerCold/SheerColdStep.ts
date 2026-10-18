// What a step of the Sheer Cold gauge reads off the world: whether heat is near the character, whether the character
// Stands in the subzero climate, whether it is swimming, the ratio the team's anti-colds hold the fill down by, and its
// Max HP, which the damage it deals is a share of
export interface SheerColdStep {
  antiColdRatio: number;
  isHeated: boolean;
  isInCold: boolean;
  isSwimming: boolean;
  maxHealth: number;
}
