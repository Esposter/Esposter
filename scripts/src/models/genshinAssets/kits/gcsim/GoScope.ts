import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";

// The reads a Go source's scope answers at a position: each name's value, and each call's numbers, read from the
// Source's own assignments, parameters and constants
export interface GoScope {
  // The numbers an argument of a call takes at the call's position: each of the two a clamp of the action's hold bounds
  // A local to, else the one number it evaluates to, and none where it evaluates to none
  readArgumentValues: (callPosition: number, argumentStart: number) => number[] | undefined;
  // Every combination of the numbers a position's function's parameters take at their call sites, a parameter no
  // Single number reaches left out of each
  readParameterIterations: (position: number) => Map<string, number>[];
  // The first token of a local's value at a position, where one assignment dominates it, as a call passing `ap` reads
  // The constructor `ap := combat.NewCircleHitOnTarget(...)` gave it
  resolveAssignment: (name: string, position: number) => number | undefined;
  // The value a name takes at a constellation at a position, where each constellation branch the constellation does
  // Not reach has its `=` left out and each it reaches takes its own, so a loop bounded by a local one raises reads the
  // Value that constellation gives it
  resolveConstellationName: (name: string, position: number, constellation: number) => GoValue | undefined;
  resolveName: (name: string, position: number) => GoValue | undefined;
}
