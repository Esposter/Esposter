import type { GoFloat } from "#src/models/genshinAssets/kits/gcsim/GoFloat";
import type { GoFrames } from "#src/models/genshinAssets/kits/gcsim/GoFrames";

// What the constant evaluator reads a Go constant or variable as: a number, a whole-valued float, a slice of values, or
// The cancel frames one of gcsim's frame helpers builds
export type GoValue = GoFloat | GoFrames | GoValue[] | number;
