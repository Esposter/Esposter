import type { ExcelTrialAvatarTemplateRow } from "#src/models/genshinAssets/trials/ExcelTrialAvatarTemplateRow";
import type { TrialTemplate } from "genshin-world";

// One level bracket's template: its reliquaries and the talent level its talents are set at
export const toTrialTemplate = ({
  TrialAvatarLevel,
  TrialAvatarSkillLevel,
  TrialReliquaryList,
}: ExcelTrialAvatarTemplateRow): TrialTemplate => ({
  level: TrialAvatarLevel,
  reliquaryIds: TrialReliquaryList,
  talentLevel: TrialAvatarSkillLevel,
});
