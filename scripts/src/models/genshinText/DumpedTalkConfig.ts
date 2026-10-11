// One row of the game's talk table, of the fields that bind a talk to its characters: its id, the characters it is
// Begun on, the quest it belongs to, how it is begun and loaded, what it waits on, each empty slot of which names no
// Type, and its first dialog. A field the dump leaves out is the game's default: no quest, no way of beginning it and
// The default load
export interface DumpedTalkConfig {
  beginCond: { type?: string }[];
  beginWay?: string;
  id: number;
  initDialog?: number;
  loadType?: string;
  npcId?: number[];
  questId?: number;
}
