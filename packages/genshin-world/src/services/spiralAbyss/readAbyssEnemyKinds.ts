import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The enemy kind each Spiral Abyss describe is fought as, keyed by the describe's id.
// `pnpm -C scripts genshin:assets spiral-abyss` publishes it, with the base variant of each describe the chambers name.
// It is fetched by its key from the hosted game data and checked against its shape as it arrives.
export const readAbyssEnemyKinds = (gameDataBaseUrl: string): Promise<Record<string, number>> =>
  readGameData(gameDataBaseUrl, "spiralAbyss/enemyKinds", z.record(z.string(), z.int().positive()));
