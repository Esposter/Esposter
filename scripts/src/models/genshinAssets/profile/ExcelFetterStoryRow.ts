import type { ExcelFetterCondition } from "#src/models/genshinAssets/profile/ExcelFetterCondition";

// One story of a character's fetters in the dump's FetterStory table: the character it belongs to, the conditions it opens
// On, and the text ids of its title and text
export interface ExcelFetterStoryRow {
  avatarId: number;
  fetterId: number;
  openConds: ExcelFetterCondition[];
  storyContextTextMapHash: number;
  storyTitleTextMapHash: number;
}
