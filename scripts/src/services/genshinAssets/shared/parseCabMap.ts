import type { CabEntry } from "#src/models/genshinAssets/shared/CabEntry";

import { readCabMap } from "#src/services/genshinAssets/shared/readCabMap";

// AnimeStudio's CAB map read from its bytes, which it writes beside itself when it maps the blocks: every serialized
// File (a CAB) of the game's blocks by its name, with the block holding it and the CABs it depends on, in the order of
// Its own table of external references, so a pointer's file index N names its file's dependency N − 1. Every name is
// Keyed lowercase, and every block with forward slashes, as the asset index names it
export const parseCabMap = (bytes: Buffer): Map<string, CabEntry> =>
  new Map(
    readCabMap(bytes).records.map(({ block, dependencies, name }): [string, CabEntry] => [
      name.toLowerCase(),
      { block: block.replaceAll("\\", "/"), dependencies: dependencies.map((dependency) => dependency.toLowerCase()) },
    ]),
  );
