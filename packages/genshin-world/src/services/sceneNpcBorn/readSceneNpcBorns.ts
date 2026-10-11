import type { SceneNpcBorn } from "#src/models/sceneNpcBorn/SceneNpcBorn";

import { sceneNpcBornSchema } from "#src/models/sceneNpcBorn/SceneNpcBorn";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The open world's NPC births in scene 3 that `pnpm -C scripts genshin:assets scene-npc-born` publishes
// Fetched by its key from the hosted game data and checked against its shape as it arrives
export const readSceneNpcBorns = (gameDataBaseUrl: string): Promise<SceneNpcBorn[]> =>
  readGameData(gameDataBaseUrl, "sceneNpcBorn/scene3", z.array(sceneNpcBornSchema));
