// One character of real code as `scanCode` yields it: the character, the bracket depth it sits at, and its index in
// The text it was scanned from.
export type CodeToken = readonly [character: string, depth: number, index: number];
