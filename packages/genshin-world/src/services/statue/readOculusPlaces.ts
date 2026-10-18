import type { GameDataKey } from "#src/models/data/GameDataKey";
import type { OculusPlace } from "#src/models/oculus/OculusPlace";

import { oculusPlaceSchema } from "#src/models/oculus/OculusPlace";
import { readGameData } from "#src/services/data/readGameData";
import { createUniqueArraySchema } from "@esposter/shared";

// A region's Oculi as `genshin:assets` publishes them under `oculi/<region>`, fetched by key from the hosted game data and
// Checked against their schema as they arrive, with each id unique. The key is typed off the lock, so a region no publish
// Wrote fails typecheck
export const readOculusPlaces = (
  gameDataBaseUrl: string,
  key: Extract<GameDataKey, `oculi/${string}`>,
): Promise<OculusPlace[]> => readGameData(gameDataBaseUrl, key, createUniqueArraySchema(oculusPlaceSchema, "id"));
