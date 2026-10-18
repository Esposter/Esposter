// An anti-cold a dish gives the team, which holds the Sheer Cold gauge's fill down by its ratio for the seconds left of it.
// The team holds one, so the next anti-cold a dish gives restarts it
export interface KitAntiCold {
  kind: "antiCold";
  // The fraction of the fill's rate it takes off, negative, as the dish's buff writes it
  ratio: number;
  secondsRemaining: number;
}
