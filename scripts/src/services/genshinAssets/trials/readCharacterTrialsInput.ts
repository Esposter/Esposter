import type { ExcelReliquaryAffixRow } from "#src/models/genshinAssets/stats/ExcelReliquaryAffixRow";
import type { ExcelReliquaryMainPropRow } from "#src/models/genshinAssets/stats/ExcelReliquaryMainPropRow";
import type { ExcelTrialAvatarActivityRow } from "#src/models/genshinAssets/trials/ExcelTrialAvatarActivityRow";
import type { ExcelTrialAvatarRow } from "#src/models/genshinAssets/trials/ExcelTrialAvatarRow";
import type { ExcelTrialAvatarTemplateRow } from "#src/models/genshinAssets/trials/ExcelTrialAvatarTemplateRow";
import type { ExcelTrialReliquaryRow } from "#src/models/genshinAssets/trials/ExcelTrialReliquaryRow";
import type { TrialTables } from "#src/models/genshinAssets/trials/TrialTables";

import {
  RELIQUARY_AFFIX_TABLE_NAME,
  RELIQUARY_MAIN_PROP_TABLE_NAME,
} from "#src/services/genshinAssets/archive/constants";
import { readRewardMap } from "#src/services/genshinAssets/rewards/readRewardMap";
import {
  TRIAL_AVATAR_TABLE_NAME,
  TRIAL_RELIQUARY_TABLE_NAME,
  TRIAL_STAGE_TABLE_NAME,
  TRIAL_TEMPLATE_TABLE_NAME,
} from "#src/services/genshinAssets/trials/constants";
import { readReliquaryPieces } from "#src/services/genshinAssets/trials/readReliquaryPieces";
import { WIKI_TRIAL_BUILDS } from "#src/services/genshinAssets/trials/wikiTrialBuilds";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";

// The character trials' tables read off the dump, and the wiki's builds, in the shape the trials builder takes them
export const readCharacterTrialsInput = (): TrialTables => ({
  affixRows: readExcelTable<ExcelReliquaryAffixRow>(RELIQUARY_AFFIX_TABLE_NAME),
  avatarRows: readExcelTable<ExcelTrialAvatarRow>(TRIAL_AVATAR_TABLE_NAME),
  mainPropRows: readExcelTable<ExcelReliquaryMainPropRow>(RELIQUARY_MAIN_PROP_TABLE_NAME),
  pieceMap: readReliquaryPieces(),
  reliquaryRows: readExcelTable<ExcelTrialReliquaryRow>(TRIAL_RELIQUARY_TABLE_NAME),
  rewardMap: readRewardMap(),
  stageRows: readExcelTable<ExcelTrialAvatarActivityRow>(TRIAL_STAGE_TABLE_NAME),
  templateRows: readExcelTable<ExcelTrialAvatarTemplateRow>(TRIAL_TEMPLATE_TABLE_NAME),
  wikiBuilds: WIKI_TRIAL_BUILDS,
});
