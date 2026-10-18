import type { TalkTables } from "#src/models/genshinText/TalkTables";
import type { Talk } from "genshin-world";

import { choiceTalkLineSchema, TalkLineKind } from "genshin-world";

// The Traveler's own lines, which the game offers as replies rather than speaking them
const PLAYER_TALK_ROLE = "TALK_ROLE_PLAYER";
// A talk as its dialogs make it: the game numbers a talk's dialogs in its own hundred, from the first, and each names
// The ones that may follow it. A line names its speaker by their character's name, the Traveler's lines are replies,
// Drawn with the mark of a plain reply until a dialog's own mark is read, and a talk whose dialogs name no followers
// At all is one the dump keeps in order, each line followed by the next. A follower outside the talk is left out. A
// Speaker's role is their manual title, by the character's id, and a narration names neither. The characters it is
// Begun on are its row's in the talk table, none where the table has no row for it
export const readTalk = (
  talkId: number,
  { npcNameTextIdMap, npcTitleTextIdMap, talkConfigMap, talkDialogsMap }: TalkTables,
): Talk => {
  const orderedDialogs = (talkDialogsMap.get(talkId) ?? []).toSorted(
    (firstDialog, secondDialog) => firstDialog.id - secondDialog.id,
  );
  const dialogIds = new Set(orderedDialogs.map(({ id }) => id));
  const isInOrder = orderedDialogs.every(({ dialog }) => dialog.nextDialogs.length === 0);
  return {
    id: String(talkId),
    lines: orderedDialogs.map(({ dialog, id }, index) => {
      const { nextDialogs, talkAudioName = "", talkContentTextMapHash, talkRole } = dialog;
      const nextLineIds = (
        isInOrder ? orderedDialogs.slice(index + 1, index + 2).map((nextDialog) => nextDialog.id) : nextDialogs
      )
        .filter((nextId) => dialogIds.has(nextId))
        .map(String);
      const textId = String(talkContentTextMapHash);
      return talkRole.type === PLAYER_TALK_ROLE
        ? {
            icon: choiceTalkLineSchema.shape.icon.enum.Talk,
            id: String(id),
            kind: TalkLineKind.Choice,
            nextLineIds,
            textId,
          }
        : {
            id: String(id),
            kind: TalkLineKind.Spoken,
            nextLineIds,
            speakerRoleTextId: npcTitleTextIdMap.get(talkRole.id ?? "") ?? "",
            speakerTextId: npcNameTextIdMap.get(talkRole.id ?? "") ?? "",
            textId,
            voiceId: talkAudioName,
          };
    }),
    npcIds: (talkConfigMap.get(talkId)?.npcId ?? []).map(String),
    startLineId: String(orderedDialogs[0]?.id ?? ""),
  };
};
