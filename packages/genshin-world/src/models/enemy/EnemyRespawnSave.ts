import { MAX_ENEMY_RESPAWN_COUNT, MAX_SAVE_ID_LENGTH, MAX_SAVE_INSTANT_LENGTH } from "#src/services/save/constants";
import { z } from "zod";

// Each defeated enemy's moment of coming back by its spawn key, in the camps with no boss among them, as an ISO string on
// The server's clock. A boss's camp is not held, as its boss comes back on the next load
export const enemyRespawnSaveSchema = z
  .record(z.string().min(1).max(MAX_SAVE_ID_LENGTH), z.iso.datetime().max(MAX_SAVE_INSTANT_LENGTH))
  .refine((respawnMap) => Object.keys(respawnMap).length <= MAX_ENEMY_RESPAWN_COUNT, "Too many enemy respawns");

export type EnemyRespawnSave = z.infer<typeof enemyRespawnSaveSchema>;
