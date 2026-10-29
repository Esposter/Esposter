import type { ParityReference } from "#src/models/genshinParity/shared/ParityReference";

// The reference a fixture variant is judged by, picked from the map entries of that variant: its first whole-screen
// entry in map order, or its first entry where it holds none whole-screen. A region only says what is scored, so it never
// decides the pick, and a pending entry is picked only where the variant holds no live one
export const getPrimaryReferenceId = (variantEntries: [string, ParityReference][]): string | undefined => {
  const liveEntries = variantEntries.filter(([, { pending }]) => pending === undefined);
  const primary = liveEntries.find(([, { region }]) => region === undefined) ?? liveEntries[0] ?? variantEntries[0];
  return primary?.[0];
};
