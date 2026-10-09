import type { GameDataPublication } from "#src/models/gameData/GameDataPublication";
import type { GameDataset } from "genshin-world";

import { GameDataTarget } from "#src/models/gameData/GameDataTarget";
import { createGameDataContainerClient } from "#src/services/gameData/createGameDataContainerClient";
import { publishGameData } from "#src/services/gameData/publishGameData";
import { readGameDataLock } from "#src/services/gameData/readGameDataLock";
import { writeGameDataLock } from "#src/services/gameData/writeGameDataLock";
import { InvalidOperationError, Operation } from "@esposter/shared";

interface PublishGameDataStepOptions {
  isDryRun: boolean;
  publication: GameDataPublication;
  scopes: GameDataset[];
}

// One generator's publish: the scopes it replaces are stored in both accounts, and the lock is rewritten only once both have
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
  if (result.isUnchanged) return `${label}: unchanged, no request made`;
  if (isDryRun) return `${label}: dry run, ${result.storedObjectCount} records would be published`;
  const { uploadedCountMap } = result;
  if (!uploadedCountMap) throw new InvalidOperationError(Operation.Update, label, "was published without a count");
  await writeGameDataLock(result.nextLock);
  return `${label}: ${result.storedObjectCount} records published, ${uploadedCountMap[GameDataTarget.Dev]} objects uploaded to dev and ${uploadedCountMap[GameDataTarget.Prod]} to prod`;
};
