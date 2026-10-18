import type { ExcelRewardPreviewRow } from "#src/models/genshinAssets/expeditions/ExcelRewardPreviewRow";
import type { ExcelBlossomGroupRow } from "#src/models/genshinAssets/leyLine/ExcelBlossomGroupRow";
import type { ExcelBlossomRefreshRow } from "#src/models/genshinAssets/leyLine/ExcelBlossomRefreshRow";
import type { ExcelBlossomSectionOrderRow } from "#src/models/genshinAssets/leyLine/ExcelBlossomSectionOrderRow";
import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { REWARD_PREVIEW_TABLE_NAME } from "#src/services/genshinAssets/domains/constants";
import { buildLeyLineRegions } from "#src/services/genshinAssets/leyLine/buildLeyLineRegions";
import { toLeyLineRegions } from "#src/services/genshinAssets/leyLine/toLeyLineRegions";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const leyLineCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish each region's ley line outcrops (its two kinds' rules, its groups' places and the sections drawn from) from the dump to the game data",
    name: "outcrops",
  },
  run: async ({ args }) => {
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: {
          indexes: {},
          objects: buildLeyLineRegions(
            toLeyLineRegions(
              readExcelTable<ExcelBlossomRefreshRow>("BlossomRefreshExcelConfigData"),
              readExcelTable<ExcelBlossomGroupRow>("BlossomGroupsExcelConfigData"),
              readExcelTable<ExcelBlossomSectionOrderRow>("BlossomSectionOrderExcelConfigData"),
              readExcelTable<ExcelRewardPreviewRow>(REWARD_PREVIEW_TABLE_NAME),
            ),
          ),
        },
        scopes: [GameDataset.LeyLine],
      }),
    );
  },
});
