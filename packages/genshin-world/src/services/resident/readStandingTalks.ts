import type { Talk } from "#src/models/dialogue/Talk";

import { talkSchema } from "#src/models/dialogue/Talk";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The residents' standing talks, as `pnpm -C scripts genshin:text standing-talks` publishes them, fetched by their key
// From the hosted game data and checked against the world's schema as they arrive
export const readStandingTalks = (gameDataBaseUrl: string): Promise<Talk[]> =>
  readGameData(gameDataBaseUrl, "standingTalks/residents", z.array(talkSchema));
