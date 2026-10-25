import type { GoBlock } from "#src/models/genshinAssets/kits/gcsim/GoBlock";

// Whether a token position sits in one of the blocks
export const checkIsInBlocks = (blocks: readonly GoBlock[], index: number): boolean =>
  blocks.some(({ end, start }) => start < index && index < end);
