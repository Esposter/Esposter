import type { DungeonsKey } from "#shared/generated/hostedAssetKeys/dungeonsKeys";

import { dungeonsLock } from "#src/services/dungeons/loader/dungeonsLock";
import { NotFoundError } from "@esposter/shared";
import { getHostedAssetUrl } from "hosted-assets";

// The url a key's object is served at under the origin the page reads hosted assets from
export const getDungeonsUrl = (origin: string, key: DungeonsKey): string => {
  const object = dungeonsLock.objects[key];
  if (object) return getHostedAssetUrl(origin, object);
  throw new NotFoundError(getDungeonsUrl.name, key);
};
