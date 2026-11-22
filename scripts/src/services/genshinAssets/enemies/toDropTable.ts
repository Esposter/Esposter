import type { DropFamilyEntry } from "#src/models/genshinAssets/enemies/DropFamilyEntry";
import type { EnemyDropTable } from "genshin-world";

import { toMaterialDrops } from "#src/services/genshinAssets/enemies/toMaterialDrops";

export const toDropTable = (
  dropFamily: string,
  { MatSet1, MatSet2, mora }: DropFamilyEntry,
  nameItemIdsMap: ReadonlyMap<string, number[]>,
): EnemyDropTable => ({
  materials: [MatSet1, MatSet2].flatMap((matSet) =>
    matSet === undefined ? [] : toMaterialDrops(dropFamily, matSet, nameItemIdsMap),
  ),
  mora,
});
