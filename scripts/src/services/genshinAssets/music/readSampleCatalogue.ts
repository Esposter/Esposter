import type { CataloguedInstrument } from "#src/models/genshinAssets/music/CataloguedInstrument";

import { fetchSampleFile } from "#src/services/genshinAssets/music/fetchSampleFile";
import { parseSfz } from "#src/services/genshinAssets/music/parseSfz";
import { SAMPLED_INSTRUMENTS } from "#src/services/genshinAssets/shared/constants";
import { readFile } from "node:fs/promises";
import { posix } from "node:path";

// Every instrument a voice may be played by, its mapping fetched and read into the regions a note plays
export const readSampleCatalogue = (): Promise<CataloguedInstrument[]> =>
  Promise.all(
    SAMPLED_INSTRUMENTS.map(async ({ library, mapping }) => {
      const mappingPath = await fetchSampleFile(library, mapping);
      const text = await readFile(mappingPath, "utf8");
      const directory = posix.dirname(mapping);
      return { library, mapping, name: posix.basename(mapping, ".sfz"), regions: parseSfz(text, directory) };
    }),
  );
