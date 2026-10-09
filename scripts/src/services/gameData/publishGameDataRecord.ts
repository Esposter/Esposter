import type { GameDataKeyScope } from "#src/models/gameData/GameDataKeyScope";

import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";

// One record published on its own, its key its scope, so its dataset's other keys stay as the lock has them: what a
// Parity loop refits after each run
export const publishGameDataRecord = (key: GameDataKeyScope, value: unknown): Promise<string> =>
  publishGameDataStep({ isDryRun: false, publication: { indexes: {}, objects: { [key]: value } }, scopes: [key] });
