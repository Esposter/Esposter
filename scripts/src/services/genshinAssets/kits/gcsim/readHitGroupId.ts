import type { KitOverlay } from "#src/models/shared/KitOverlay";

import { readMultiplierGroupId } from "#src/services/genshinAssets/kits/gcsim/readMultiplierGroupId";

// A named hit's path, `hits.<name>` with or without a run index, which names the hit and the run it is
const HIT_PATH_REGEX = /^hits\.(?<name>[^.]+)(?:\.(?<index>\d+))?\./u;

// The proud skill group of the hit a `hits.<name>` path names: its run's multiplier's where the path names a run and
// The overlay gives one, else the name's
export const readHitGroupId = (path: string, overlay: KitOverlay): number | undefined => {
  const groups = HIT_PATH_REGEX.exec(path)?.groups;
  if (groups === undefined) return undefined;
  const { index, name } = groups;
  if (index === undefined) return readMultiplierGroupId(overlay, `hits.${name}.multiplier`);
  return (
    readMultiplierGroupId(overlay, `hits.${name}.${index}.multiplier`) ??
    readMultiplierGroupId(overlay, `hits.${name}.multiplier`)
  );
};
