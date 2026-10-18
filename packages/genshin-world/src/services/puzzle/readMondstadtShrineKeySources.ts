import type { ShrineKeySource } from "#src/models/puzzle/ShrineKeySource";

import { shrineKeySourceSchema } from "#src/models/puzzle/ShrineKeySource";
import { readGameData } from "#src/services/data/readGameData";
import { createUniqueArraySchema } from "@esposter/shared";

// The Shrine of Depths keys Mondstadt's region is opened with, as `genshin:assets shrineKeySources` publishes them, fetched
// By their key from the hosted game data and checked against their schema as they arrive, with each source's id unique
export const readMondstadtShrineKeySources = (gameDataBaseUrl: string): Promise<ShrineKeySource[]> =>
  readGameData(gameDataBaseUrl, "shrineKeySources/mondstadt", createUniqueArraySchema(shrineKeySourceSchema, "id"));
