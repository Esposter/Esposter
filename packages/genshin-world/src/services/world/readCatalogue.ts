import type { Catalogue } from "#src/models/world/Catalogue";

import { catalogueSchema } from "#src/models/world/Catalogue";
import { readGameData } from "#src/services/data/readGameData";

// The catalogue every view reads, fetched by its key from the hosted game data as `genshin:data authored` publishes it
// And checked against its schema as it arrives
export const readCatalogue = (gameDataBaseUrl: string): Promise<Catalogue> =>
  readGameData(gameDataBaseUrl, "catalogue/catalogue", catalogueSchema);
