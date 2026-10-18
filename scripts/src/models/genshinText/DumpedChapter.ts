// One row of the game's chapter table, of the fields a series needs: its id, its title and number by text hash, the City it
// Is in by its id, and the quest its last quest is by its sub quest id
export interface DumpedChapter {
  chapterNumTextMapHash: number;
  chapterTitleTextMapHash: number;
  cityId: number;
  endQuestId: number;
  id: number;
}
