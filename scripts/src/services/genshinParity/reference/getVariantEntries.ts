import type { ParityReference } from "#src/models/genshinParity/shared/ParityReference";

// The map entries that name a fixture variant, in map order: the variant's screen and its variant, where a screen's base
// is the variant ""
export const getVariantEntries = (
  referenceMap: Record<string, ParityReference>,
  screen: string,
  variant: string,
): [string, ParityReference][] =>
  Object.entries(referenceMap).filter(
    ([, reference]) => reference.screen === screen && (reference.variant ?? "") === variant,
  );
