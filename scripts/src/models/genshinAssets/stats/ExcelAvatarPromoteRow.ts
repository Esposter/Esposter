import type { ExcelProperty } from "#src/models/genshinAssets/stats/ExcelProperty";

// One ascension phase of a character's, the first of them at level zero
export interface ExcelAvatarPromoteRow {
  addProps: ExcelProperty[];
  avatarPromoteId: number;
  promoteLevel: number;
  unlockMaxLevel: number;
}
