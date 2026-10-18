// The bitwise operations whose right side is skipped when the left side decides them, as the compiler skips it
export const LAZY_BINARY_NAMES: ReadonlySet<string> = new Set(["bitAnd", "bitOr"]);
