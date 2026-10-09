// The loader of each opponent deck's slice by the deck's id in the game's table, as `genshin:assets gcg` writes them. A
// Slice is imported on demand, so a deck's cards sit in no page's bundle until a duel is set up with it
export const GcgDeckLoaderMap: ReadonlyMap<number, () => Promise<unknown>> = new Map([
  [1, async () => (await import("#src/generated/gcg/deck1.json")).default],
  [2, async () => (await import("#src/generated/gcg/deck2.json")).default],
  [3, async () => (await import("#src/generated/gcg/deck3.json")).default],
  [4, async () => (await import("#src/generated/gcg/deck4.json")).default],
  [7, async () => (await import("#src/generated/gcg/deck7.json")).default],
  [11_002, async () => (await import("#src/generated/gcg/deck11002.json")).default],
  [11_005, async () => (await import("#src/generated/gcg/deck11005.json")).default],
  [30_111, async () => (await import("#src/generated/gcg/deck30111.json")).default],
  [30_112, async () => (await import("#src/generated/gcg/deck30112.json")).default],
]);
