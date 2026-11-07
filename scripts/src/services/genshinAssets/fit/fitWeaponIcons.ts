import type { GameDataBuild } from "#src/models/shared/GameDataBuild";

import { traceWeaponIcon } from "#src/services/genshinAssets/fit/traceWeaponIcon";
import { readPngNames } from "#src/services/genshinAssets/shared/readPngNames";
import { WEAPON_ICON_DIRECTORY } from "#src/services/genshinAssets/weapons/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { GameDataset } from "genshin-world";
import { join } from "node:path";

// Every exported weapon icon as the loops round where it is painted, in the icon's own unit square, published as numbers
// Under one key by the icon's name. An icon with nothing painted is reported and left out
export const fitWeaponIcons = async (): Promise<GameDataBuild> => {
  const names = readPngNames(WEAPON_ICON_DIRECTORY).toSorted();
  if (names.length === 0)
    throw new InvalidOperationError(Operation.Read, WEAPON_ICON_DIRECTORY, "holds no icon: run weapon-icons first");
  const entries = await Promise.all(
    names.map(async (name) => [name, await traceWeaponIcon(join(WEAPON_ICON_DIRECTORY, `${name}.png`))] as const),
  );
  const outlines = Object.fromEntries(entries.filter(([, loops]) => loops.length > 0));
  const emptyNames = entries.filter(([, loops]) => loops.length === 0).map(([name]) => name);
  const loopCount = Object.values(outlines).reduce((sum, loops) => sum + loops.length, 0);
  return {
    notes: [
      `${Object.keys(outlines).length} weapon icon outlines fitted, ${loopCount} loops in all`,
      ...(emptyNames.length > 0 ? [`${emptyNames.length} icons with nothing painted: ${emptyNames.join(", ")}`] : []),
    ],
    objects: { [`${GameDataset.WeaponShapes}/icons`]: outlines },
  };
};
