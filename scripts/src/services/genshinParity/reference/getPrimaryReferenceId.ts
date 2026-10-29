import type { ParityReference } from "#src/models/genshinParity/shared/ParityReference";

// The reference a fixture variant is judged by, picked from the map entries of that variant. The snapshot is the
// fixture's default render, which an entry with no `props` override renders as it is and an entry with one does not, so
// those entries are preferred: the first whole-screen one, else the first. Where every live entry overrides props, the
// first whole-screen one, else the first live one. A region only says what is scored, and a pending entry is picked
// only where the variant holds no live one
export const getPrimaryReferenceId = (variantEntries: [string, ParityReference][]): string | undefined => {
  const liveEntries = variantEntries.filter(([, { pending }]) => pending === undefined);
  const defaultRenderEntries = liveEntries.filter(([, { props }]) => props === undefined);
  const primary =
    defaultRenderEntries.find(([, { region }]) => region === undefined) ??
    defaultRenderEntries[0] ??
    liveEntries.find(([, { region }]) => region === undefined) ??
    liveEntries[0] ??
    variantEntries[0];
  return primary?.[0];
};
