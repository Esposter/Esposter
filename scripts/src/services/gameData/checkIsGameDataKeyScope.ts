import type { GameDataKeyScope } from "#src/models/gameData/GameDataKeyScope";

import { checkIsGameDataset } from "#src/services/gameData/checkIsGameDataset";
import { takeOne } from "@esposter/shared";

export const checkIsGameDataKeyScope = (key: string): key is GameDataKeyScope =>
  key.includes("/") && checkIsGameDataset(takeOne(key.split("/")));
