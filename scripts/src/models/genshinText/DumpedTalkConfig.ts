// One row of the game's talk table, of the fields that bind a talk to its characters: its id, the characters it is
// Begun on, the quest it belongs to, how it is begun and loaded, what it waits on with each condition's parameters,
// Each empty slot of which names no type, and its first dialog. A number or a list the dump leaves out is written back
// As 0 or an empty list, so no quest is 0 and no first dialog is 0; a string it leaves out is the game's default, which
// Its reader names itself
export interface DumpedTalkConfig {
  beginCond: { param?: string[]; type?: string }[];
  beginWay?: string;
  id: number;
  initDialog: number;
  loadType?: string;
  npcId: number[];
  questId: number;
}
