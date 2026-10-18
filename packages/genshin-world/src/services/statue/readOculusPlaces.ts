import type { OculusPlace } from "#src/models/oculus/OculusPlace";

import { GameDataset } from "#src/models/data/GameDataset";
import { oculusPlaceSchema } from "#src/models/oculus/OculusPlace";
import { readGameData } from "#src/services/data/readGameData";
import { createUniqueArraySchema } from "@esposter/shared";

// A region's Oculi as `genshin:assets` publishes them under `oculi/<region>`, fetched by key from the hosted game data and
// Checked against their schema as they arrive, with each id unique
export const readOculusPlaces = (gameDataBaseUrl: string, regionId: string): Promise<OculusPlace[]> =>
  readGameData(gameDataBaseUrl, `${GameDataset.Oculi}/${regionId}`, createUniqueArraySchema(oculusPlaceSchema, "id"));
