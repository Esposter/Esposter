import type { GameDataObjectRef } from "#src/models/gameData/GameDataObjectRef";

import { getGameDataObjectName } from "genshin-world";
import { getHostedAssetPath } from "hosted-assets";

// The key one stored object is kept under in its bucket, and the path its url names under any origin
export const getGameDataObjectKey = ({ dataset, hash }: GameDataObjectRef): string =>
  getHostedAssetPath(getGameDataObjectName(dataset, hash));
