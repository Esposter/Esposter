// One condition a story's open or finish list names, as the dump writes it: its kind, and the numbers it is read with
export interface ExcelFetterCondition {
  condType: string;
  paramList: number[];
}

// One story of a character's fetters in the dump's FetterStory table: the character it belongs to, the conditions it opens
// On, and the text ids of its title and text
export interface ExcelFetterStoryRow {
  avatarId: number;
  fetterId: number;
  openConds: ExcelFetterCondition[];
  storyContextTextMapHash: number;
  storyTitleTextMapHash: number;
}
