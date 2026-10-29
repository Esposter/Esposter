import type { GameDataScope } from "#src/models/gameData/GameDataScope";

import { checkIsGameDataset } from "#src/services/gameData/checkIsGameDataset";
import { takeOne } from "@esposter/shared";

export const keepUnscopedEntries = (entries: Record<string, string>, scopes: GameDataScope[]): Record<string, string> =>
  Object.fromEntries(
    Object.entries(entries).filter(([key]) => {
      const dataset = takeOne(key.split("/"));
      return checkIsGameDataset(dataset) && !scopes.some((scope) => scope === key || scope === dataset);
    }),
  );
