import type { ExcelTrialReliquaryRow } from "#src/models/genshinAssets/trials/ExcelTrialReliquaryRow";
import type { TrialReliquary } from "genshin-world";

// One reliquary with its artifact, level, main stat and sub-stats
export const toTrialReliquary = ({
  AppendPropList,
  Id,
  Level,
  MainPropId,
  ReliquaryId,
}: ExcelTrialReliquaryRow): TrialReliquary => ({
  appendPropIds: AppendPropList,
  id: Id,
  level: Level,
  mainPropId: MainPropId,
  reliquaryId: ReliquaryId,
});
