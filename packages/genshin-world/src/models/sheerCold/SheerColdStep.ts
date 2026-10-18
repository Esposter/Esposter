// What a step of the Sheer Cold gauge reads off the world: whether heat is near the character, whether the character
// Stands in the subzero climate, whether a snowstorm is over it, whether it is swimming, the ratio the team's anti-colds
// Hold the fill down by, and its max HP, which the damage it deals is a share of
export interface SheerColdStep {
  antiColdRatio: number;
  isHeated: boolean;
  isInCold: boolean;
  isSnowstorm: boolean;
  isSwimming: boolean;
  maxHealth: number;
}
