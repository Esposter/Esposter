// One row of the game's talk table, of the fields that bind a talk to its characters: its id, the characters it is
// Begun on, the quest it belongs to, how it is begun and loaded, what it waits on, each empty slot of which names no
// Type, and its first dialog. A number or a list the dump leaves out is written back as 0 or an empty list, so no quest
// Is 0 and no first dialog is 0; a string it leaves out is the game's default, which its reader names itself
export interface DumpedTalkConfig {
  beginCond: { type?: string }[];
  beginWay?: string;
  id: number;
  initDialog: number;
  loadType?: string;
  npcId: number[];
  questId: number;
}
