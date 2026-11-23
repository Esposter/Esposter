import type { DungeonsKey } from "#shared/generated/hostedAssetKeys/dungeonsKeys";
import type { MonsterKey } from "#shared/models/dungeons/keys/MonsterKey";

import { MonsterKeyFileKeyMap } from "#src/services/dungeons/monster/MonsterKeyFileKeyMap";
import { NotFoundError } from "@esposter/shared";

// A species the map does not hold fails here, naming it, rather than drawing a monster with no texture
export const getMonsterFileKey = (key: MonsterKey) => {
  const fileKey: DungeonsKey | undefined = MonsterKeyFileKeyMap[key];
  if (fileKey) return fileKey;
  throw new NotFoundError(getMonsterFileKey.name, key);
};
