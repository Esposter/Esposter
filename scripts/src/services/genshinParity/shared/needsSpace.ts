import type { Token } from "#src/models/genshinParity/shared/Token";

import { SvgPathTokenType } from "#src/models/genshinParity/shared/SvgPathTokenType";

// A space only where two numbers would otherwise read as one: a flag is always spaced, a number that starts with a minus
// Sign needs none, and a number that starts with a point needs none after a number that already has a point
export const needsSpace = (previous: Token, next: Token): boolean => {
  if (previous.type === SvgPathTokenType.Letter || next.type === SvgPathTokenType.Letter) return false;
  if (previous.type === SvgPathTokenType.Flag || next.type === SvgPathTokenType.Flag) return true;
  if (next.text.startsWith("-")) return false;
  return !next.text.startsWith(".") || !previous.text.includes(".");
};
