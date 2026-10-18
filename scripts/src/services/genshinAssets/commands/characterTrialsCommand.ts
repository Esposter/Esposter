import type { ExcelRewardRow } from "#src/models/genshinAssets/rewards/ExcelRewardRow";
import type { ExcelTrialAvatarActivityRow } from "#src/models/genshinAssets/trials/ExcelTrialAvatarActivityRow";
import type { ExcelTrialAvatarRow } from "#src/models/genshinAssets/trials/ExcelTrialAvatarRow";
import type { ExcelTrialAvatarTemplateRow } from "#src/models/genshinAssets/trials/ExcelTrialAvatarTemplateRow";
import type { ExcelTrialReliquaryRow } from "#src/models/genshinAssets/trials/ExcelTrialReliquaryRow";
import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildTrials } from "#src/services/genshinAssets/trials/buildTrials";
import {
  TRIAL_AVATAR_TABLE_NAME,
  TRIAL_RELIQUARY_TABLE_NAME,
  TRIAL_STAGE_TABLE_NAME,
  TRIAL_TEMPLATE_TABLE_NAME,
} from "#src/services/genshinAssets/trials/constants";
import { WIKI_TRIAL_BUILDS } from "#src/services/genshinAssets/trials/wikiTrialBuilds";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const characterTrialsCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish the character trials' stages, the trial avatars at their levels, the reliquaries and templates they wear, and the items each stage's first-clear reward pays, from the trial tables of the dump",
    name: "character-trials",
  },
  run: async ({ args }) => {
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: {
          indexes: {},
          objects: buildTrials({
            avatarRows: readExcelTable<ExcelTrialAvatarRow>(TRIAL_AVATAR_TABLE_NAME),
            reliquaryRows: readExcelTable<ExcelTrialReliquaryRow>(TRIAL_RELIQUARY_TABLE_NAME),
            rewardMap: new Map(
              readExcelTable<ExcelRewardRow>("RewardExcelConfigData").map((reward) => [reward.rewardId, reward]),
            ),
            stageRows: readExcelTable<ExcelTrialAvatarActivityRow>(TRIAL_STAGE_TABLE_NAME),
            templateRows: readExcelTable<ExcelTrialAvatarTemplateRow>(TRIAL_TEMPLATE_TABLE_NAME),
            wikiBuilds: WIKI_TRIAL_BUILDS,
          }),
        },
        scopes: [GameDataset.CharacterTrials],
      }),
    );
  },
});
