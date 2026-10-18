import type { DumpedChapter } from "#src/models/genshinText/DumpedChapter";
import type { DumpedGiving } from "#src/models/genshinText/DumpedGiving";
import type { DumpedGivingGroup } from "#src/models/genshinText/DumpedGivingGroup";
import type { DumpedMainQuest } from "#src/models/genshinText/DumpedMainQuest";
import type { DumpedSubQuest } from "#src/models/genshinText/DumpedSubQuest";
import type { Quest, QuestId } from "genshin-world";

import { buildQuestChapters } from "#src/services/genshinText/buildQuestChapters";
import { buildTextChunks } from "#src/services/genshinText/buildTextChunks";
import {
  CHAPTER_TABLE_NAME,
  GIVING_GROUP_TABLE_NAME,
  GIVING_TABLE_NAME,
  MAIN_QUEST_DEFAULT_TYPE,
  MAIN_QUEST_TABLE_NAME,
  QUEST_BINARY_DIRECTORY,
  SUB_QUEST_TABLE_NAME,
} from "#src/services/genshinText/constants";
import { DumpedQuestKindMap } from "#src/services/genshinText/DumpedQuestKindMap";
import { getTalkTextIds } from "#src/services/genshinText/getTalkTextIds";
import { OpeningParentTitleMap } from "#src/services/genshinText/OpeningParentTitleMap";
import { readCarriedMainQuestId } from "#src/services/genshinText/readCarriedMainQuestId";
import { readCarriedQuestRewards } from "#src/services/genshinText/readCarriedQuestRewards";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { readOpeningParentQuestIds } from "#src/services/genshinText/readOpeningParentQuestIds";
import { readParentQuestIds } from "#src/services/genshinText/readParentQuestIds";
import { readQuestSteps } from "#src/services/genshinText/readQuestSteps";
import { readReputationRequestQuest } from "#src/services/genshinText/readReputationRequestQuest";
import { readTalk } from "#src/services/genshinText/readTalk";
import { readTalkTables } from "#src/services/genshinText/readTalkTables";
import { readTextMap } from "#src/services/genshinText/readTextMap";
import { readTitleQuestIds } from "#src/services/genshinText/readTitleQuestIds";
import { mapCollectingFailures } from "#src/services/shared/mapCollectingFailures";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { GameLanguage, GameLanguages } from "genshin-text";
import {
  GameDataset,
  QuestIds,
  QuestKind,
  QuestObjectiveKind,
  questSchema,
  ReputationRequestQuestIds,
} from "genshin-world";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Every quest `QuestId` names, published: its kind, title and description from the quest table, its shown steps and the
// Talks offering it from its binary output, the talks its steps end on and its offers from the dialog and talk tables, the
// Items its finish pays from its reward rows, and every word they show, a language missing a word taking English's and
// Saying so. An Archon quest starts from the prologue's first rather than from a talk, so it has no offer. Each quest is
// Checked against the world's own schema before it is published. A Reputation request has no binary: its sub quest's title
// Comes from its world quest, and its one step from its giving row
export const buildQuests = async (): Promise<{ notes: string[]; objects: Record<string, unknown> }> => {
  const notes: string[] = [];
  const englishTextMap = readTextMap(GameLanguage.English);
  const mainQuestMap = new Map(
    readExcelTable<DumpedMainQuest>(MAIN_QUEST_TABLE_NAME).map((mainQuest) => [mainQuest.id, mainQuest]),
  );
  const subQuestMap = new Map(
    readExcelTable<DumpedSubQuest>(SUB_QUEST_TABLE_NAME).map((subQuest) => [subQuest.subId, subQuest]),
  );
  const givingMap = new Map(readExcelTable<DumpedGiving>(GIVING_TABLE_NAME).map((giving) => [giving.id, giving]));
  const givingGroupMap = new Map(
    readExcelTable<DumpedGivingGroup>(GIVING_GROUP_TABLE_NAME).map((givingGroup) => [givingGroup.id, givingGroup]),
  );
  // A quest is named by its title, and a chapter by the quest its end quest is in, for the wiki's named prerequisites
  const titleQuestIds = readTitleQuestIds(
    englishTextMap,
    [...mainQuestMap.values()],
    readExcelTable<DumpedChapter>(CHAPTER_TABLE_NAME),
    subQuestMap,
  );
  const carriedQuestIds = new Set<string>(QuestIds);
  const rewardsByQuest = readCarriedQuestRewards();
  const talkTables = await readTalkTables();
  const mainQuestIds = new Set(mainQuestMap.keys());
  const mainIdBySubId = new Map([...subQuestMap].map(([subId, subQuest]) => [subId, subQuest.mainId] as const));
  const buildQuest = (questId: QuestId): Quest => {
    const rewards = rewardsByQuest.get(questId) ?? [];
    if (ReputationRequestQuestIds.includes(questId)) {
      const subQuest = subQuestMap.get(Number(questId));
      const giving = givingMap.get(Number(questId));
      const mainQuest = subQuest && mainQuestMap.get(subQuest.mainId);
      if (!subQuest || !giving || !mainQuest)
        throw new InvalidOperationError(Operation.Read, questId, "has no sub quest, giving or world quest row");
      return readReputationRequestQuest({ giving, givingGroupMap, mainQuest, rewards, subQuest });
    }
    // A city's opening quest is one sub quest of its world quest: titled by that world quest, read from its binary
    const mainQuestId = readCarriedMainQuestId(Number(questId), mainQuestIds, mainIdBySubId);
    const mainQuest = mainQuestId === undefined ? undefined : mainQuestMap.get(mainQuestId);
    if (!mainQuest) throw new InvalidOperationError(Operation.Read, MAIN_QUEST_TABLE_NAME, `has no quest ${questId}`);
    const questType = mainQuest.type ?? MAIN_QUEST_DEFAULT_TYPE;
    const questKind = DumpedQuestKindMap[questType];
    if (!questKind) throw new InvalidOperationError(Operation.Read, questId, `has the unknown type ${questType}`);
    const questBinary = parseMachineJson<Record<string, unknown>>(
      readFileSync(join(QUEST_BINARY_DIRECTORY, `${mainQuest.id}.json`), "utf8"),
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
    const parentQuestIds = [
      ...new Set([
        ...readParentQuestIds(questBinary, mainQuest.id, subQuestMap),
        ...readOpeningParentQuestIds(OpeningParentTitleMap[questId]?.titles ?? [], mainQuest.id, titleQuestIds),
      ]),
    ].map(String);
    const uncarriedParentQuestIds = parentQuestIds.filter((parentQuestId) => !carriedQuestIds.has(parentQuestId));
    if (uncarriedParentQuestIds.length > 0)
      notes.push(
        `${OpeningParentTitleMap[questId]?.region ?? questId} quest ${questId} waits on ${uncarriedParentQuestIds.join(", ")}, which the world does not carry yet, so it stays unstarted until that region loads`,
      );
    const talkIds = new Set([
      ...offerTalkIds.map(Number),
      ...steps.flatMap(({ objectives }) =>
        objectives
          .filter(({ kind }) => kind === QuestObjectiveKind.TalkTo)
          .flatMap(({ targetIds }) => targetIds.map(Number)),
      ),
    ]);
    return questSchema.parse({
      descriptionTextId: String(mainQuest.descTextMapHash),
      id: questId,
      kind: questKind,
      offerTalkIds,
      parentQuestIds,
      rewards,
      steps,
      talks: Array.from(talkIds, (talkId) => readTalk(talkId, talkTables)),
      titleTextId: String(mainQuest.titleTextMapHash),
    });
  };
  const quests = mapCollectingFailures(GameDataset.Quests, QuestIds, buildQuest);
  const parentQuestIds = quests.flatMap((quest) => quest.parentQuestIds);
  const uncarriedParentQuestIds = parentQuestIds.filter((parentQuestId) => !carriedQuestIds.has(parentQuestId));
  notes.push(
    `${quests.filter((quest) => quest.parentQuestIds.length > 0).length} quests wait on ${parentQuestIds.length} parent quests, and ${uncarriedParentQuestIds.length} of those name a quest the world does not carry, so those quests stay unstarted`,
  );
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
