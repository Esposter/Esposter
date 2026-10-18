// One level bracket of the game's trial avatar template table: the reliquaries a trial avatar of that level wears, and the
// Talent level its talents are set at
export interface ExcelTrialAvatarTemplateRow {
  TrialAvatarLevel: number;
  TrialAvatarSkillLevel: number;
  TrialReliquaryList: number[];
}
