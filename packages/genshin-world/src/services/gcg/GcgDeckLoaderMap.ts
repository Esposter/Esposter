// The loader of each opponent deck's slice by the deck's id in the game's table, as `genshin:assets gcg` writes them. A
// Slice is imported on demand, so a deck's cards sit in no page's bundle until a duel is set up with it
export const GcgDeckLoaderMap: ReadonlyMap<number, () => Promise<unknown>> = new Map([
  [1, async () => (await import("#src/generated/gcg/deck1.json")).default],
  [3, async () => (await import("#src/generated/gcg/deck3.json")).default],
  [4, async () => (await import("#src/generated/gcg/deck4.json")).default],
]);
