import type { ReturnedConstellationComparison } from "#src/models/genshinAssets/kits/gcsim/ReturnedConstellationComparison";

// A block a constellation test opens, `if c.Base.Cons < 4 {` or `if c.Base.Cons >= 4 {`, that ends in a return: the code
// After it, in the block it sits in, runs only where the test fails
export interface ReturnedConstellationGate {
  comparison: ReturnedConstellationComparison;
  end: number;
  ifPosition: number;
  scopeEnd: number;
  scopeStart: number;
  threshold: number;
}
