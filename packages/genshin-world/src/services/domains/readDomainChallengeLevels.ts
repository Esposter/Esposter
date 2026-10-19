import type { DomainChallengeLevelMap } from "#src/models/domains/DomainChallengeLevelMap";

import { GameDataset } from "#src/models/data/GameDataset";
import { domainChallengeLevelMapSchema } from "#src/models/domains/DomainChallengeLevelMap";
import { readGameData } from "#src/services/data/readGameData";

// The domains' challenge levels as `genshin:data authored` publishes them, fetched by their key from the hosted game
// Data and checked against their schema as they arrive
export const readDomainChallengeLevels = (gameDataBaseUrl: string): Promise<DomainChallengeLevelMap> =>
  readGameData(gameDataBaseUrl, `${GameDataset.DomainChallengeLevels}/levels`, domainChallengeLevelMapSchema);
