import type { CabEntry } from "#src/models/genshinAssets/shared/CabEntry";

import { readCabMap } from "#src/services/genshinAssets/shared/readCabMap";

// AnimeStudio's CAB map read from its bytes, which it writes beside itself when it maps the blocks: every serialized
// File (a CAB) of the game's blocks by its name, with the block holding it, its offset there and the CABs it depends
// On, in the order of its own table of external references, so a pointer's file index N names its file's dependency
// N − 1. Every name is keyed lowercase, and every block with forward slashes, as the asset index names it
export const parseCabMap = (bytes: Buffer): Map<string, CabEntry> =>
  new Map(
    readCabMap(bytes).records.map(({ block, dependencies, name, offset }): [string, CabEntry] => [
      name.toLowerCase(),
      {
        block: block.replaceAll("\\", "/"),
        dependencies: dependencies.map((dependency) => dependency.toLowerCase()),
        offset,
      },
    ]),
  );
