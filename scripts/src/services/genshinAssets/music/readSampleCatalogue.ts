import type { CataloguedInstrument } from "#src/models/genshinAssets/music/CataloguedInstrument";

import { parseSfz } from "#src/services/genshinAssets/music/parseSfz";
import { readSfzMapping } from "#src/services/genshinAssets/music/readSfzMapping";
import { SAMPLED_INSTRUMENTS } from "#src/services/genshinAssets/shared/constants";
import { posix } from "node:path";

// Every instrument a voice may be played by, its mapping fetched with every file it includes and read into the regions a
// Note plays
export const readSampleCatalogue = (): Promise<CataloguedInstrument[]> =>
  Promise.all(
    SAMPLED_INSTRUMENTS.map(async ({ library, mapping }) => {
      const text = await readSfzMapping(library, mapping);
      const directory = posix.dirname(mapping);
      return { library, mapping, name: posix.basename(mapping, ".sfz"), regions: parseSfz(text, directory) };
    }),
  );
