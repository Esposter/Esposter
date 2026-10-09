import { GameDataTarget } from "#src/models/gameData/GameDataTarget";

// Each account's blob endpoint, the one an app reads its game data from under the same container
export const GameDataTargetBlobServiceUrlMap: Readonly<Record<GameDataTarget, string>> = {
  [GameDataTarget.Dev]: "https://devstesposter001.blob.core.windows.net",
  [GameDataTarget.Prod]: "https://prodstesposter001.blob.core.windows.net",
};
