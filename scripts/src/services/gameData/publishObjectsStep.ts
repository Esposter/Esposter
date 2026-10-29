import type { DryRunOptions } from "#src/models/shared/DryRunOptions";
import type { GameDataPublication } from "#src/models/shared/GameDataPublication";

import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { toGameDataKeyScopes } from "#src/services/gameData/toGameDataKeyScopes";

interface PublishObjectsStepOptions extends DryRunOptions {
  objects: GameDataPublication["objects"];
}

// A generator that publishes records under their own keys and no index: each key is its own scope, so the step replaces
// Only the records it names and keeps the rest of its dataset
export const publishObjectsStep = ({ isDryRun, objects }: PublishObjectsStepOptions): Promise<string> =>
  publishGameDataStep({
    isDryRun,
    publication: { indexes: {}, objects },
    scopes: toGameDataKeyScopes(Object.keys(objects)),
  });
