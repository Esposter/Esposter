import type { WildlifePlace } from "#src/models/wildlife/WildlifePlace";

import { wildlifePlaceSchema } from "#src/models/wildlife/WildlifePlace";
import { readGameData } from "#src/services/data/readGameData";
import { createUniqueArraySchema } from "@esposter/shared";

// Mondstadt's wildlife places as `genshin:assets wildlife` publishes them, fetched by their key from the hosted game
// Data and checked against their schema as they arrive, with each place's id unique
export const readMondstadtWildlifePlaces = (gameDataBaseUrl: string): Promise<WildlifePlace[]> =>
  readGameData(gameDataBaseUrl, "wildlife/mondstadt", createUniqueArraySchema(wildlifePlaceSchema, "id"));
