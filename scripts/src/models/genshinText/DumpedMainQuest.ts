// One row of the game's quest table, of the fields a quest needs: its id, its type's code, which an Archon quest
// Leaves out, and its title and description by text hash
export interface DumpedMainQuest {
  descTextMapHash: number;
  id: number;
  titleTextMapHash: number;
  type?: string;
}
