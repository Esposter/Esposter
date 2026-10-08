import type { ExcelProperty } from "#src/models/genshinAssets/stats/ExcelProperty";

// One ascension phase of a character's, the phase left out where it is the first
export interface ExcelAvatarPromoteRow {
  addProps: ExcelProperty[];
  avatarPromoteId: number;
  promoteLevel?: number;
  unlockMaxLevel: number;
}
