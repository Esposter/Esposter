import type { Catalogue } from "#src/models/world/Catalogue";

import { catalogueSchema } from "#src/models/world/Catalogue";
import { readGameData } from "#src/services/data/readGameData";

// The catalogue as `genshin:data authored` publishes it, fetched by its key from the hosted game data and checked
// Against its schema as it arrives
export const readCatalogue = (gameDataBaseUrl: string): Promise<Catalogue> =>
  readGameData(gameDataBaseUrl, "catalogue/catalogue", catalogueSchema);
