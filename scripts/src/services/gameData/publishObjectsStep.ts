import type { PublishObjectsStepOptions } from "#src/models/gameData/PublishObjectsStepOptions";

import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { toGameDataKeyScopes } from "#src/services/gameData/toGameDataKeyScopes";

// A generator that publishes records under their own keys and no index: each key is its own scope, so the step replaces
// Only the records it names and keeps the rest of its dataset. A retired key is a scope too, with no record, so its
// Line Leaves the lock
export const publishObjectsStep = ({ isDryRun, objects, retired = [] }: PublishObjectsStepOptions): Promise<string> =>
  publishGameDataStep({
    isDryRun,
    publication: { indexes: {}, objects },
    scopes: toGameDataKeyScopes([...Object.keys(objects), ...retired]),
  });
