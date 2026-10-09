import type { DumpedDialogSpeaker } from "#src/models/genshinAssets/residents/DumpedDialogSpeaker";
import type { DumpedDialog } from "#src/models/genshinText/DumpedDialog";

import { DIALOG_PATH, SCRAMBLED_KEY_REGEX } from "#src/services/genshinText/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { readFile } from "node:fs/promises";

// The NPC lines of the game's dialog table, each with the talk it belongs to. A talk is the game's own hundred of dialog
// Ids, as the quest talks are read, and a line the Traveler or a narration says names no NPC and is left out
export const readDialogSpeakers = async (): Promise<DumpedDialogSpeaker[]> => {
  const dialogRows = parseMachineJson<(DumpedDialog & Record<string, unknown>)[]>(await readFile(DIALOG_PATH, "utf8"));
  const idKey = Object.keys(dialogRows[0] ?? {}).find((key) => SCRAMBLED_KEY_REGEX.test(key));
  if (!idKey) throw new InvalidOperationError(Operation.Read, DIALOG_PATH, "has no scrambled id field");
  return dialogRows.flatMap((dialog) => {
    const { talkRole } = dialog;
    if (talkRole?.type !== "TALK_ROLE_NPC") return [];
    return [{ speakerId: Number(talkRole.id), talkId: Math.floor(Number(dialog[idKey]) / 100) }];
  });
};
