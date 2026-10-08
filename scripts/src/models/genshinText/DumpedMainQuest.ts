// One row of the game's quest table, of the fields a quest needs: its id, its type's code, and its title and
// Description by text hash
export interface DumpedMainQuest {
  descTextMapHash: number;
  id: number;
  titleTextMapHash: number;
  type: string;
}
