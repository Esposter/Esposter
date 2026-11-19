import type { FishingPropPlace } from "#src/models/fishing/FishingPropPlace";

import { fishingPropPlaceSchema } from "#src/models/fishing/FishingPropPlace";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The fishing-area props of each region `pnpm -C scripts genshin:assets fishing` publishes, each with its place, turn and
// Scale, fetched by its key from the hosted game data and checked against its shape as it arrives
export const readFishingProps = (gameDataBaseUrl: string): Promise<Record<string, FishingPropPlace[]>> =>
  readGameData(gameDataBaseUrl, "fishing/props", z.record(z.string(), z.array(fishingPropPlaceSchema)));
