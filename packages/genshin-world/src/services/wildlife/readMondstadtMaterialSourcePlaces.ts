import type { MaterialSourcePlace } from "#src/models/wildlife/MaterialSourcePlace";

import { materialSourcePlaceSchema } from "#src/models/wildlife/MaterialSourcePlace";
import { readGameData } from "#src/services/data/readGameData";
import { createUniqueArraySchema } from "@esposter/shared";

// Mondstadt's material sources as `genshin:assets materialSources` publishes them, fetched by their key from the hosted
// Game data and checked against their schema as they arrive, with each source's id unique
export const readMondstadtMaterialSourcePlaces = (gameDataBaseUrl: string): Promise<MaterialSourcePlace[]> =>
  readGameData(gameDataBaseUrl, "materialSources/mondstadt", createUniqueArraySchema(materialSourcePlaceSchema, "id"));
