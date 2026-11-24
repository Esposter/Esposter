import type { ExcelAvatarExtraLevelRow } from "#src/models/genshinAssets/stats/ExcelAvatarExtraLevelRow";
import type { MasterlessLevelLift } from "genshin-world";

import { AVATAR_EXTRA_LEVEL_TABLE_NAME } from "#src/services/genshinAssets/stats/constants";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { takeOne } from "@esposter/shared";
import { masterlessLevelLiftSchema } from "genshin-world/definitions";

// Each lift past a level cap the game's extra-level table holds: the level it lifts from and to, and how many of the
// Masterless Stella Fortuna it takes, the one item its cost names
export const getMasterlessLevelLifts = (): MasterlessLevelLift[] =>
  readExcelTable<ExcelAvatarExtraLevelRow>(AVATAR_EXTRA_LEVEL_TABLE_NAME, {
    costItems: "costItems",
    fromLevel: "DEJBOJMHHJB",
    level: "BBPEGJLEEEC",
  }).map(({ costItems, fromLevel, level }) =>
    masterlessLevelLiftSchema.parse({ count: takeOne(costItems, 0).count, fromLevel, level }),
  );
