import type { CabEntry } from "#src/models/recreation/animeStudio/CabEntry";

// The file holding an asset at its block and offset, as the asset index gives an asset: the index holds a file's offset
// In its block rather than the file, so the CAB map's files are keyed by their block and offset once for every lookup
export const createBlockOffsetFileFinder = (
  cabMap: ReadonlyMap<string, CabEntry>,
): ((block: string, offset: number) => string | undefined) => {
  const blockOffsetFileMap = new Map<string, string>();
  for (const [file, { block, offset }] of cabMap) blockOffsetFileMap.set(`${block}|${offset}`, file);
  return (block, offset) => blockOffsetFileMap.get(`${block}|${offset}`);
};
