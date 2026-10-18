// One row of the game's chapter table, of the fields a series needs: its id, its title and number by text hash, and the
// City it is in by its id
export interface DumpedChapter {
  chapterNumTextMapHash: number;
  chapterTitleTextMapHash: number;
  cityId: number;
  id: number;
}
