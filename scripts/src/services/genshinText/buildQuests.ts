import type { DumpedMainQuest } from "#src/models/genshinText/DumpedMainQuest";
import type { Quest } from "genshin-world";

import { buildQuestChapters } from "#src/services/genshinText/buildQuestChapters";
import { buildTextChunks } from "#src/services/genshinText/buildTextChunks";
import {
  MAIN_QUEST_DEFAULT_TYPE,
  MAIN_QUEST_TABLE_NAME,
  QUEST_BINARY_DIRECTORY,
} from "#src/services/genshinText/constants";
import { DumpedQuestKindMap } from "#src/services/genshinText/DumpedQuestKindMap";
import { getTalkTextIds } from "#src/services/genshinText/getTalkTextIds";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { readQuestSteps } from "#src/services/genshinText/readQuestSteps";
import { readTalk } from "#src/services/genshinText/readTalk";
import { readTalkTables } from "#src/services/genshinText/readTalkTables";
import { readTextMap } from "#src/services/genshinText/readTextMap";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { GameLanguage, GameLanguages } from "genshin-text";
import { GameDataset, QuestIds, QuestKind, QuestObjectiveKind, questSchema } from "genshin-world";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Every quest `QuestId` names, published: its kind, title and description from the quest table, its shown steps and the
// Talks offering it from its binary output, the talks its steps end on and its offers from the dialog and talk tables,
// And every word they show, a language missing a word taking English's and saying so. An Archon quest starts from the
// Prologue's first rather than from a talk, so it has no offer. Each quest is checked against the world's own schema
// Before it is published
export const buildQuests = async (): Promise<{ notes: string[]; objects: Record<string, unknown> }> => {
  const notes: string[] = [];
  const englishTextMap = readTextMap(GameLanguage.English);
  const mainQuestMap = new Map(
    readExcelTable<DumpedMainQuest>(MAIN_QUEST_TABLE_NAME).map((mainQuest) => [mainQuest.id, mainQuest]),
  );
  const talkTables = await readTalkTables();
  const quests: Quest[] = QuestIds.map((questId) => {
    const mainQuest = mainQuestMap.get(Number(questId));
    if (!mainQuest) throw new InvalidOperationError(Operation.Read, MAIN_QUEST_TABLE_NAME, `has no quest ${questId}`);
    const questType = mainQuest.type ?? MAIN_QUEST_DEFAULT_TYPE;
    const questKind = DumpedQuestKindMap[questType];
    if (!questKind) throw new InvalidOperationError(Operation.Read, questId, `has the unknown type ${questType}`);
    const questBinary = parseMachineJson<Record<string, unknown>>(
      readFileSync(join(QUEST_BINARY_DIRECTORY, `${questId}.json`), "utf8"),
    );
    const {
      notes: stepNotes,
      offerTalkIds: readOfferTalkIds,
      steps,
    } = readQuestSteps(
      questBinary,
      Number(questId),
      (hash) => englishTextMap.has(String(hash)),
      (talkId) => readTalk(Number(talkId), talkTables).lines.length > 0,
    );
    notes.push(...stepNotes);
    const offerTalkIds = questKind === QuestKind.Archon ? [] : readOfferTalkIds;
    const talkIds = new Set([
      ...offerTalkIds.map(Number),
      ...steps.flatMap(({ objectives }) =>
        objectives.filter(({ kind }) => kind === QuestObjectiveKind.TalkTo).map(({ targetId }) => Number(targetId)),
      ),
    ]);
    return questSchema.parse({
      descriptionTextId: String(mainQuest.descTextMapHash),
      id: questId,
      kind: questKind,
      offerTalkIds,
      steps,
      talks: Array.from(talkIds, (talkId) => readTalk(talkId, talkTables)),
      titleTextId: String(mainQuest.titleTextMapHash),
    });
  });
  const chapters = buildQuestChapters();
  const textIds = new Set([
    ...quests.flatMap(({ descriptionTextId, steps, talks, titleTextId }) => [
      descriptionTextId,
      titleTextId,
      ...steps.map(({ textId }) => textId),
      ...talks.flatMap((talk) => getTalkTextIds(talk)),
    ]),
    ...chapters.flatMap(({ numberTextId, regionTextId, titleTextId }) => [numberTextId, regionTextId, titleTextId]),
  ]);
  textIds.delete("");
  const { notes: textNotes, objects: textObjects } = buildTextChunks(GameDataset.QuestText, [...textIds]);
  notes.push(
    ...textNotes,
    `${quests.length} quests in ${chapters.length} series, and ${textIds.size} of their words, written in ${GameLanguages.length} languages`,
  );
  return {
    notes,
    objects: {
      ...Object.fromEntries(quests.map((quest) => [`${GameDataset.Quests}/${quest.id}`, quest])),
      [`${GameDataset.Quests}/chapters`]: chapters,
      ...textObjects,
    },
  };
};
