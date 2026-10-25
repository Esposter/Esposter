import type { CallTiming } from "#src/models/genshinAssets/kits/gcsim/CallTiming";

// One way a method's queue call is run, by one call of the method: the delay its call adds, and the values its call
// Gives the method's parameters
export interface CallVariant extends CallTiming {
  parameters: Map<string, number>;
}
