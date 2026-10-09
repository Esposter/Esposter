import type { GameDataPublication } from "#src/models/gameData/GameDataPublication";
import type { GameDataset } from "genshin-world";

import { GameDataPublishOutcome } from "#src/models/gameData/GameDataPublishOutcome";
import { GameDataTarget } from "#src/models/gameData/GameDataTarget";
import { commitGameDataLock } from "#src/services/gameData/commitGameDataLock";
import { createGameDataContainerClient } from "#src/services/gameData/createGameDataContainerClient";
import { publishGameData } from "#src/services/gameData/publishGameData";
import { readGameDataLock } from "#src/services/gameData/readGameDataLock";

interface PublishGameDataStepOptions {
  isDryRun: boolean;
  publication: GameDataPublication;
  scopes: GameDataset[];
}

// One generator's publish: the scopes it replaces are stored in both accounts, and the lock is committed only once both have
// Them. A dry run stores nothing and needs no credential. Returns a note of what the step did to the lock
export const publishGameDataStep = async ({
  isDryRun,
  publication,
  scopes,
}: PublishGameDataStepOptions): Promise<string> => {
  const label = scopes.join(", ");
  const result = await publishGameData({
    containerClientMap: isDryRun
      ? undefined
      : {
          [GameDataTarget.Dev]: createGameDataContainerClient(GameDataTarget.Dev),
          [GameDataTarget.Prod]: createGameDataContainerClient(GameDataTarget.Prod),
        },
    currentLock: await readGameDataLock(),
    publication,
    scopes,
  });
  if (result.outcome === GameDataPublishOutcome.Unchanged) return `${label}: unchanged, no request made`;
  if (result.outcome === GameDataPublishOutcome.DryRun)
    return `${label}: dry run, ${result.storedObjectCount} records would be published`;
  await commitGameDataLock(scopes, result.plannedLock);
  const { uploadedCountMap } = result;
  return `${label}: ${result.storedObjectCount} records published, ${uploadedCountMap[GameDataTarget.Dev]} objects uploaded to dev and ${uploadedCountMap[GameDataTarget.Prod]} to prod`;
};
