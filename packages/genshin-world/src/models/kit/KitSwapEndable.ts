// An effect its character leaving the field may end: a stance, a buff, an infusion or a summon, a summon's character being
// The one that cast it
export interface KitSwapEndable {
  // Whether its character leaving the field ends it
  isEndedOnSwap?: true;
}
