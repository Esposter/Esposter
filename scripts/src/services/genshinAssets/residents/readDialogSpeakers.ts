import type { DumpedDialogSpeaker } from "#src/models/genshinAssets/residents/DumpedDialogSpeaker";

import { readDialogTable } from "#src/services/genshinText/readDialogTable";

// The NPC lines of the game's dialog table, each with the talk it belongs to. A talk is the game's own hundred of dialog
// Ids, as the quest talks are read, and a line the Traveler or a narration says names no NPC and is left out
export const readDialogSpeakers = (): DumpedDialogSpeaker[] => {
  const { dialogRows, idKey } = readDialogTable();
  return dialogRows.flatMap((dialog) => {
    const { talkRole } = dialog;
    if (talkRole?.type !== "TALK_ROLE_NPC") return [];
    return [{ speakerId: Number(talkRole.id), talkId: Math.floor(Number(dialog[idKey]) / 100) }];
  });
};
