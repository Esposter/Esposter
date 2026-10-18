// One row of the game's quest table, of the fields a quest needs: its id, its type's code, which an Archon quest
// Leaves out, and its title and description by text hash. Its chapter is the series it belongs to, 0 for none, and its
// Rewards are the reward rows its finish gives
export interface DumpedMainQuest {
  chapterId: number;
  descTextMapHash: number;
  id: number;
  rewardIdList: number[];
  titleTextMapHash: number;
  type?: string;
}
