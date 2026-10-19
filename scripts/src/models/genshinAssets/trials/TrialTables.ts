import type { ExcelRewardRow } from "#src/models/genshinAssets/rewards/ExcelRewardRow";
import type { ExcelReliquaryAffixRow } from "#src/models/genshinAssets/stats/ExcelReliquaryAffixRow";
import type { ExcelReliquaryMainPropRow } from "#src/models/genshinAssets/stats/ExcelReliquaryMainPropRow";
import type { ExcelTrialAvatarActivityRow } from "#src/models/genshinAssets/trials/ExcelTrialAvatarActivityRow";
import type { ExcelTrialAvatarRow } from "#src/models/genshinAssets/trials/ExcelTrialAvatarRow";
import type { ExcelTrialAvatarTemplateRow } from "#src/models/genshinAssets/trials/ExcelTrialAvatarTemplateRow";
import type { ExcelTrialReliquaryRow } from "#src/models/genshinAssets/trials/ExcelTrialReliquaryRow";
import type { TrialReliquaryPiece } from "#src/models/genshinAssets/trials/TrialReliquaryPiece";
import type { WikiTrialBuild } from "#src/models/genshinAssets/trials/WikiTrialBuild";

// The rows and maps the character trials are built from, read from the game's tables and the wiki's pages
export interface TrialTables {
  affixRows: ExcelReliquaryAffixRow[];
  avatarRows: ExcelTrialAvatarRow[];
  mainPropRows: ExcelReliquaryMainPropRow[];
  pieceMap: ReadonlyMap<number, TrialReliquaryPiece>;
  reliquaryRows: ExcelTrialReliquaryRow[];
  rewardMap: ReadonlyMap<number, ExcelRewardRow>;
  stageRows: ExcelTrialAvatarActivityRow[];
  templateRows: ExcelTrialAvatarTemplateRow[];
  wikiBuilds: readonly WikiTrialBuild[];
}
