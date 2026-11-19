// The entries the matches keep, read from each source in turn and stopped after the limit when one is given.
// Stopping early reads no further into the sources, so a search that finds its rows reads no more of the index
export const readMatchingEntries = async function* <TEntry>(
  sources: AsyncIterable<TEntry>[],
  matches: (entry: TEntry) => boolean,
  limit?: number,
): AsyncGenerator<TEntry> {
  let count = 0;
  for (const source of sources)
    for await (const entry of source) {
      if (!matches(entry)) continue;
      yield entry;
      count += 1;
      if (count === limit) return;
    }
};
