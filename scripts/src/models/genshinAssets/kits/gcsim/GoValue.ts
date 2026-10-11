import type { GoFrames } from "#src/models/genshinAssets/kits/gcsim/GoFrames";

// What the constant evaluator reads a Go constant or variable as: a number, a slice of values, or the cancel frames one
// Of gcsim's frame helpers builds
export type GoValue = GoFrames | GoValue[] | number;
