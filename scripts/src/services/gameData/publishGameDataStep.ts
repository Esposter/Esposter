import type { PublishGameDataStepOptions } from "#src/models/gameData/PublishGameDataStepOptions";

import { publishGameDataPlan } from "#src/services/gameData/publishGameDataPlan";
import { planHostedAssetPublication } from "#src/services/hostedAssets/planHostedAssetPublication";

// One generator's publish from its records: the records are planned, then published as one plan. See
// `publishGameDataPlan`
export const publishGameDataStep = ({ isDryRun, publication, scopes }: PublishGameDataStepOptions): Promise<string> =>
  publishGameDataPlan({ isDryRun, plan: planHostedAssetPublication(publication), scopes });
