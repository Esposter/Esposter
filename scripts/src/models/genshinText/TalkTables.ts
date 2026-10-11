import type { DumpedDialog } from "#src/models/genshinText/DumpedDialog";
import type { DumpedTalkConfig } from "#src/models/genshinText/DumpedTalkConfig";

// The tables a talk is read from: each character's name and manual title by their id, each talk's row of the talk table
// By its id, and each talk's dialogs by its id, a talk being the game's own hundred of dialog ids
export interface TalkTables {
  npcNameTextIdMap: ReadonlyMap<string, string>;
  npcTitleTextIdMap: ReadonlyMap<string, string>;
  talkConfigMap: ReadonlyMap<number, DumpedTalkConfig>;
  talkDialogsMap: ReadonlyMap<number, { dialog: DumpedDialog; id: number }[]>;
}
