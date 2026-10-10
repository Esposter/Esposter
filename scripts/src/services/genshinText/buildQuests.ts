import type { DumpedDialog } from "#src/models/genshinText/DumpedDialog";
import type { DumpedMainQuest } from "#src/models/genshinText/DumpedMainQuest";
import type { DumpedNpc } from "#src/models/genshinText/DumpedNpc";
import type { Quest } from "genshin-world";

import { buildTextChunks } from "#src/services/genshinText/buildTextChunks";
import {
  DIALOG_PATH,
  MAIN_QUEST_PATH,
  NPC_PATH,
  QUEST_BINARY_DIRECTORY,
  SCRAMBLED_KEY_REGEX,
} from "#src/services/genshinText/constants";
import { DumpedQuestKindMap } from "#src/services/genshinText/DumpedQuestKindMap";
import { readQuestSteps } from "#src/services/genshinText/readQuestSteps";
import { readTalk } from "#src/services/genshinText/readTalk";
import { readTextMap } from "#src/services/genshinText/readTextMap";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { GameLanguage, GameLanguages } from "genshin-text";
import { GameDataset, QuestIds, QuestObjectiveKind, questSchema, TalkLineKind } from "genshin-world";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Every quest `QuestId` names, published: its kind, title and description from the quest table, its shown steps from its
// Binary output, the talks its steps end on from the dialog table, and every word they show, a language missing a word
// Taking English's and saying so. Each quest is checked against the world's own schema before it is published
export const buildQuests = (): { notes: string[]; objects: Record<string, unknown> } => {
  const notes: string[] = [];
  const englishTextMap = readTextMap(GameLanguage.English);
  const mainQuestMap = new Map(
    parseMachineJson<DumpedMainQuest[]>(readFileSync(MAIN_QUEST_PATH, "utf8")).map((mainQuest) => [
      mainQuest.id,
      mainQuest,
    ]),
  );
  const dialogRows = parseMachineJson<(DumpedDialog & Record<string, unknown>)[]>(readFileSync(DIALOG_PATH, "utf8"));
  const idKey = Object.keys(dialogRows[0] ?? {}).find((key) => SCRAMBLED_KEY_REGEX.test(key));
  if (!idKey) throw new InvalidOperationError(Operation.Read, DIALOG_PATH, "has no scrambled id field");
  const talkDialogsMap = Map.groupBy(
    dialogRows.map((dialog) => ({ dialog, id: Number(dialog[idKey]) })),
    ({ id }) => Math.floor(id / 100),
  );
  const npcNameTextIdMap = new Map(
    parseMachineJson<DumpedNpc[]>(readFileSync(NPC_PATH, "utf8")).map(({ id, nameTextMapHash }) => [
      String(id),
      String(nameTextMapHash),
    ]),
  );
  const quests: Quest[] = QuestIds.map((questId) => {
    const mainQuest = mainQuestMap.get(Number(questId));
    if (!mainQuest) throw new InvalidOperationError(Operation.Read, MAIN_QUEST_PATH, `has no quest ${questId}`);
    const questKind = DumpedQuestKindMap[mainQuest.type];
    if (!questKind) throw new InvalidOperationError(Operation.Read, questId, `has the unknown type ${mainQuest.type}`);
    const questBinary = parseMachineJson<Record<string, unknown>>(
      readFileSync(join(QUEST_BINARY_DIRECTORY, `${questId}.json`), "utf8"),
    );
    const { notes: stepNotes, steps } = readQuestSteps(questBinary, Number(questId), (hash) =>
      englishTextMap.has(String(hash)),
    );
    notes.push(...stepNotes);
    const talkIds = new Set(
      steps.flatMap(({ objectives }) =>
        objectives.filter(({ kind }) => kind === QuestObjectiveKind.TalkTo).map(({ targetId }) => Number(targetId)),
      ),
    );
    return questSchema.parse({
      descriptionTextId: String(mainQuest.descTextMapHash),
      id: questId,
      kind: questKind,
      steps,
      talks: Array.from(talkIds, (talkId) => readTalk(talkId, talkDialogsMap.get(talkId) ?? [], npcNameTextIdMap)),
      titleTextId: String(mainQuest.titleTextMapHash),
    });
  });
  const textIds = new Set(
    quests.flatMap(({ descriptionTextId, steps, talks, titleTextId }) => [
      descriptionTextId,
      titleTextId,
      ...steps.map(({ textId }) => textId),
      ...talks.flatMap(({ lines }) =>
        lines.flatMap((line) =>
          line.kind === TalkLineKind.Spoken ? [line.textId, line.speakerTextId] : [line.textId],
        ),
      ),
    ]),
  );
  textIds.delete("");
  const { notes: textNotes, objects: textObjects } = buildTextChunks(GameDataset.QuestText, [...textIds].toSorted());
  notes.push(
    ...textNotes,
    `${quests.length} quests, and ${textIds.size} of their words, written in ${GameLanguages.length} languages`,
  );
  return {
    notes,
    objects: {
      ...Object.fromEntries(quests.map((quest) => [`${GameDataset.Quests}/${quest.id}`, quest])),
      ...textObjects,
    },
  };
};
