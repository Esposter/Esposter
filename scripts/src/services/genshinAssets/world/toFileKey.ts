import type { CabEntry } from "#src/models/recreation/animeStudio/CabEntry";

// The one key a file of the game's blocks is held by across the asset index and the CAB map: its block and its offset
export const toFileKey = ({ block, offset }: Pick<CabEntry, "block" | "offset">): string => `${block}@${offset}`;
