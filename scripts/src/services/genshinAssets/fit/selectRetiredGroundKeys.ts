import type { SelectRetiredGroundKeysOptions } from "#src/models/genshinAssets/fit/SelectRetiredGroundKeysOptions";

import { GameDataset } from "genshin-world";

// The plateau a publish retires from the lock: its region's `ground/<region>`, once the publish stores a piece of the
// Region and the lock then holds a piece of every outlined surface area. An area's piece is its key or a key under it,
// So a split area's quarters and a joined pair count. Until every area has one, the plateau stays, since a region's
// Pieces over a missing area would leave a hole where the plateau stood. A region that outlines no area is never
// Retired, as nothing would stand in the plateau's place
export const selectRetiredGroundKeys = ({
  areaIds,
  lockKeys,
  publishedKeys,
  region,
}: SelectRetiredGroundKeysOptions): string[] => {
  const plateauKey = `${GameDataset.Ground}/${region}`;
  const groundKeys = [...lockKeys, ...publishedKeys];
  const isPublishingPiece = publishedKeys.some((key) => key.startsWith(`${plateauKey}/`));
  const isEveryAreaPieced = areaIds.every((areaId) => {
    const areaKey = `${plateauKey}/${areaId}`;
    return groundKeys.some((key) => key === areaKey || key.startsWith(`${areaKey}/`));
  });
  return lockKeys.includes(plateauKey) && isPublishingPiece && areaIds.length > 0 && isEveryAreaPieced
    ? [plateauKey]
    : [];
};
