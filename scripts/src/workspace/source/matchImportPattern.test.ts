import { describe } from "vitest";

// The text a specifier holds where an `imports` pattern's `*` stands, or undefined when the pattern does not match it.
// An exact key, with no `*`, matches only itself and holds nothing
export const matchImportPattern = (pattern: string, specifier: string): string | undefined => {
  const starIndex = pattern.indexOf("*");
  if (starIndex === -1) return pattern === specifier ? "" : undefined;
  const prefix = pattern.slice(0, starIndex);
  const suffix = pattern.slice(starIndex + 1);
  return specifier.startsWith(prefix) && specifier.endsWith(suffix) && specifier.length >= pattern.length - 1
    ? specifier.slice(prefix.length, specifier.length - suffix.length)
    : undefined;
};

describe.todo("matchImportPattern");
